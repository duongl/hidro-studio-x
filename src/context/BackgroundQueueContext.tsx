import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Project, SceneCard, DNALock, AIDirectorInsight, ProjectAssets, normalizeAssets } from '../types';
import { generateSyntheticCinematicSvg } from '../utils';

export interface BackgroundJob {
  id: string;
  type: 'asset_analysis' | 'director_analysis' | 'script_generation' | 'image_generation' | 'prompt_generation';
  status: 'pending' | 'running' | 'completed' | 'failed';
  sceneNumber?: number;
  sceneId?: string;
  progress: number;
  title: string;
  description: string;
  attempts: number;
  maxAttempts: number;
  error?: string;
}

interface BackgroundQueueContextType {
  activeProject: Project | null;
  setActiveProject: (project: Project | null) => void;
  jobs: BackgroundJob[];
  addJob: (job: Omit<BackgroundJob, 'id' | 'status' | 'progress' | 'attempts'>) => string;
  restartJob: (id: string) => void;
  cancelJob: (id: string) => void;
  clearQueue: () => void;
  startVisualProduction: () => void;
  stopVisualProduction: () => void;
  isVisualProductionRunning: boolean;
  recoveryNotice: {
    scenesCount: number;
    imagesCompleted: number;
    renderingCount: number;
  } | null;
  dismissRecovery: () => void;
  triggerAssetAnalysis: (assets: ProjectAssets) => void;
  triggerDirectorAnalysis: () => void;
  triggerScriptGeneration: (payload: { mode: 'ai' | 'paste'; idea?: string; goal?: string; audience?: string; hook?: string; cta?: string; rawText?: string }) => void;
}

const BackgroundQueueContext = createContext<BackgroundQueueContextType | undefined>(undefined);

export function useBackgroundQueue() {
  const context = useContext(BackgroundQueueContext);
  if (!context) {
    throw new Error('useBackgroundQueue must be used within a BackgroundQueueProvider');
  }
  return context;
}

function safeSaveProject(p: Project) {
  try {
    localStorage.setItem('hidro_studio_active_project', JSON.stringify(p));
  } catch (e: any) {
    if (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014 || String(e).includes('QuotaExceededError')) {
      console.warn('LocalStorage quota exceeded! Attempting to trim image assets...');
      try {
        const trimmed: Project = JSON.parse(JSON.stringify(p));
        if (trimmed.assets) {
          const categories: ('character' | 'product' | 'background' | 'style')[] = [
            'character',
            'product',
            'background',
            'style'
          ];
          categories.forEach(cat => {
            const mod = trimmed.assets[cat];
            if (mod && Array.isArray(mod.items)) {
              mod.items.forEach(it => {
                it.imageBase64 = undefined;
              });
            }
          });
        }
        localStorage.setItem('hidro_studio_active_project', JSON.stringify(trimmed));
        console.log('Saved trimmed project details without heavy offline image memory.');
      } catch (innerError) {
        try {
          const minimalProject: Project = JSON.parse(JSON.stringify(p));
          if (minimalProject.scenes) {
            minimalProject.scenes = minimalProject.scenes.map(s => ({
              ...s,
              imageUrl: '',
            }));
          }
          if (minimalProject.assets) {
            const categories: ('character' | 'product' | 'background' | 'style')[] = [
              'character',
              'product',
              'background',
              'style'
            ];
            categories.forEach(cat => {
              const mod = minimalProject.assets[cat];
              if (mod && Array.isArray(mod.items)) {
                mod.items.forEach(it => {
                  it.imageBase64 = undefined;
                });
              }
            });
          }
          localStorage.setItem('hidro_studio_active_project', JSON.stringify(minimalProject));
          console.log('Saved minimal project to avoid quota crash.');
        } catch (superInnerError) {
          console.error('Totally unable to write project to local storage:', superInnerError);
        }
      }
    } else {
      console.error('Failed storing active project details:', e);
    }
  }
}

function safeSaveJobs(jobs: BackgroundJob[]) {
  try {
    localStorage.setItem('hidro_studio_background_jobs', JSON.stringify(jobs));
  } catch (e: any) {
    console.warn('Failed storing background jobs to localStorage:', e);
    try {
      const activeJobs = jobs.filter(j => j.status === 'running' || j.status === 'pending');
      localStorage.setItem('hidro_studio_background_jobs', JSON.stringify(activeJobs));
    } catch {
      // Just ignore, letting it run in memory
    }
  }
}

export function BackgroundQueueProvider({ children }: { children: React.ReactNode }) {
  // Try restore project first from persistence
  const [activeProject, setActiveProjectState] = useState<Project | null>(() => {
    try {
      const stored = localStorage.getItem('hidro_studio_active_project');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object' && parsed.id) {
          if (parsed.assets) {
            parsed.assets = normalizeAssets(parsed.assets);
          }
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed parsing active project memory during provider boot:', e);
    }
    return null;
  });

  // Restore background jobs if any
  const [jobs, setJobs] = useState<BackgroundJob[]>(() => {
    try {
      const stored = localStorage.getItem('hidro_studio_background_jobs');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Reset running jobs to pending on boot so they can resume
          return parsed.map((j: BackgroundJob) => 
            j.status === 'running' ? { ...j, status: 'pending', progress: 0 } : j
          );
        }
      }
    } catch (e) {
       console.warn('Failed restoring background jobs:', e);
    }
    return [];
  });

  const [isVisualProductionRunning, setIsVisualProductionRunning] = useState(false);
  const [recoveryNotice, setRecoveryNotice] = useState<{
    scenesCount: number;
    imagesCompleted: number;
    renderingCount: number;
  } | null>(null);

  const runningJobsRef = useRef<Set<string>>(new Set());
  const latestProjectRef = useRef<Project | null>(activeProject);

  useEffect(() => {
    latestProjectRef.current = activeProject;
  }, [activeProject]);

  // Sync project to storage on change
  const setActiveProject = (p: Project | null) => {
    setActiveProjectState(p);
    if (p) {
      safeSaveProject(p);
    } else {
      localStorage.removeItem('hidro_studio_active_project');
      localStorage.removeItem('hidro_studio_background_jobs');
      setJobs([]);
      setIsVisualProductionRunning(false);
    }
  };

  // Sync jobs list on change
  useEffect(() => {
    safeSaveJobs(jobs);
  }, [jobs]);

  // Handle Recovery check on boot
  useEffect(() => {
    const isRecoveredSession = sessionStorage.getItem('hidro_studio_recovered');
    if (activeProject && !isRecoveredSession) {
      const scenesCount = activeProject.scenes?.length || 0;
      const imagesCompleted = activeProject.scenes?.filter(s => s.status === 'completed').length || 0;
      const renderingCount = jobs.filter(j => j.status === 'running' || j.status === 'pending').length;

      if (scenesCount > 0 && (imagesCompleted > 0 || renderingCount > 0)) {
        setRecoveryNotice({
          scenesCount,
          imagesCompleted,
          renderingCount
        });
      }
      sessionStorage.setItem('hidro_studio_recovered', 'true');
    }
  }, [activeProject]);

  const dismissRecovery = () => {
    setRecoveryNotice(null);
  };

  // Utility to add a job
  const addJob = (job: Omit<BackgroundJob, 'id' | 'status' | 'progress' | 'attempts'>): string => {
    const id = `job-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newJob: BackgroundJob = {
      ...job,
      id,
      status: 'pending',
      progress: 0,
      attempts: 0
    };
    setJobs(prev => [...prev, newJob]);
    return id;
  };

  // Cancel job
  const cancelJob = (id: string) => {
    setJobs(prev => prev.filter(j => j.id !== id));
  };

  // Restart job
  const restartJob = (id: string) => {
    setJobs(prev => prev.map(j => {
      if (j.id === id) {
        return { ...j, status: 'pending', progress: 0, attempts: 0, error: undefined };
      }
      return j;
    }));
  };

  // Clear jobs queue
  const clearQueue = () => {
    setJobs(prev => prev.filter(j => j.status === 'running'));
  };

  // START VISUAL PRODUCTION
  const startVisualProduction = () => {
    if (!activeProject || !activeProject.scenes || activeProject.scenes.length === 0) return;
    
    setIsVisualProductionRunning(true);
    
    // Create image rendering jobs for all scenes that are NOT completed
    const renderingJobsToAdd: Omit<BackgroundJob, 'id' | 'status' | 'progress' | 'attempts'>[] = [];
    const promptJobsToAdd: Omit<BackgroundJob, 'id' | 'status' | 'progress' | 'attempts'>[] = [];

    activeProject.scenes.forEach(scene => {
      if (scene.status !== 'completed') {
        // Enqueue image render
        renderingJobsToAdd.push({
          type: 'image_generation',
          sceneNumber: scene.sceneNumber,
          sceneId: scene.id,
          title: `Render Scheme: Scene ${scene.sceneNumber}`,
          description: `Baking consistent Brand DNA with high-contrast ambient refractions.`,
          maxAttempts: 3
        });

        // Enqueue parallel Prompt Engine generator / video dynamics prep (Multi-Task Pipeline)
        promptJobsToAdd.push({
          type: 'prompt_generation',
          sceneNumber: scene.sceneNumber,
          sceneId: scene.id,
          title: `AI Prompt Lock: Scene ${scene.sceneNumber}`,
          description: `Compiling motion velocity vectors, dolly cameras, and ASMR vocal parameters.`,
          maxAttempts: 1
        });
      }
    });

    // Bulk add jobs
    if (renderingJobsToAdd.length > 0) {
      setJobs(prev => {
        // Filter out existing pending/running/failed jobs for these scene IDs to prevent duplicates
        const filtered = prev.filter(j => 
          !(j.type === 'image_generation' && renderingJobsToAdd.some(rj => rj.sceneId === j.sceneId)) &&
          !(j.type === 'prompt_generation' && promptJobsToAdd.some(pj => pj.sceneId === j.sceneId))
        );

        const fresh_image_jobs = renderingJobsToAdd.map((job, idx) => ({
          ...job,
          id: `img-gen-${job.sceneId}-${Date.now()}-${idx}`,
          status: 'pending' as const,
          progress: 0,
          attempts: 0
        }));

        const fresh_prompt_jobs = promptJobsToAdd.map((job, idx) => ({
          ...job,
          id: `prompt-gen-${job.sceneId}-${Date.now()}-${idx}`,
          status: 'pending' as const,
          progress: 0,
          attempts: 0
        }));

        return [...filtered, ...fresh_image_jobs, ...fresh_prompt_jobs];
      });
    }
  };

  const stopVisualProduction = () => {
    setIsVisualProductionRunning(false);
    // Pause pending image gen jobs
    setJobs(prev => prev.map(j => {
      if (j.type === 'image_generation' && j.status === 'pending') {
        return { ...j, status: 'failed', error: 'User stopped visual pipeline' };
      }
      return j;
    }));
  };

  // JOB RUNNER BACKGROUND SYSTEM ENGINE
  useEffect(() => {
    const activeJobs = jobs.filter(j => j.status === 'running');
    const pendingJobs = jobs.filter(j => j.status === 'pending');

    // Sync runningJobsRef to remove any jobs that are no longer 'running'
    const currentRunningIds = new Set(activeJobs.map(j => j.id));
    for (const id of runningJobsRef.current) {
      if (!currentRunningIds.has(id)) {
        runningJobsRef.current.delete(id);
      }
    }

    if (pendingJobs.length === 0 && activeJobs.length === 0) return;

    // Define concurrency limits
    // Max 1 running 'image_generation' job at any time (sequential render)
    const runningImageGens = activeJobs.filter(j => j.type === 'image_generation');
    // Max 2 running other jobs at any time
    const runningOthers = activeJobs.filter(j => j.type !== 'image_generation');

    let jobsToStart: BackgroundJob[] = [];

    // Select sequential image generation if available and not currently rendering one
    if (runningImageGens.length === 0) {
      const nextImageJob = pendingJobs.find(j => j.type === 'image_generation');
      if (nextImageJob) {
        jobsToStart.push(nextImageJob);
      }
    }

    // Select concurrent task jobs (assets, director, script, prompts)
    const nextOthers = pendingJobs.filter(j => j.type !== 'image_generation');
    const slotsAvailable = 2 - runningOthers.length;
    if (slotsAvailable > 0 && nextOthers.length > 0) {
      jobsToStart.push(...nextOthers.slice(0, slotsAvailable));
    }

    if (jobsToStart.length > 0) {
      setJobs(prev => prev.map(j => {
        if (jobsToStart.some(jt => jt.id === j.id)) {
          return { ...j, status: 'running', progress: 5 };
        }
        return j;
      }));
      // Let the next rendering tick process the executing action
      return;
    }

    // Process executing jobs
    activeJobs.forEach(job => {
      if (runningJobsRef.current.has(job.id)) {
        return;
      }
      runningJobsRef.current.add(job.id);

      if (job.progress >= 95) return; // Wait for finish triggers

      // 1. ASSET ANALYSIS
      if (job.type === 'asset_analysis') {
        const interval = setInterval(() => {
          setJobs(prev => prev.map(j => {
            if (j.id === job.id) {
              const nextProg = Math.min(100, j.progress + 25);
              if (nextProg >= 100) {
                // Completed scanned action
                clearInterval(interval);
                setTimeout(() => {
                  setJobs(curr => curr.map(c => c.id === job.id ? { ...c, status: 'completed', progress: 100 } : c));
                  // Save assets completion to project
                  if (latestProjectRef.current) {
                    setActiveProject({
                      ...latestProjectRef.current,
                      assetsAnalyzed: true
                    });
                  }
                }, 300);
                return { ...j, progress: 100 };
              }
              return { ...j, progress: nextProg };
            }
            return j;
          }));
        }, 800);

        return () => clearInterval(interval);
      }

      // 2. DIRECTOR ANALYSIS
      if (job.type === 'director_analysis') {
        let simProgress = job.progress;
        const progressTimer = setInterval(() => {
          setJobs(prev => prev.map(j => {
            if (j.id === job.id && j.status === 'running') {
              simProgress = Math.min(90, simProgress + 10);
              return { ...j, progress: simProgress };
            }
            return j;
          }));
        }, 600);

        // Fetch execution
        const runScan = async () => {
          try {
            const proj = latestProjectRef.current;
            const response = await fetch('/api/director/analyze', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                projectName: proj?.name,
                type: proj?.type,
                platform: proj?.platform,
                assets: proj?.assets,
              }),
            });

            if (!response.ok) {
              const text = await response.text();
              let errorMsg = 'Directorial Analysis failed';
              try {
                const errJson = JSON.parse(text);
                errorMsg = errJson.error || errorMsg;
              } catch (_) {
                errorMsg = text.length > 150 ? text.substring(0, 150) + '...' : text || errorMsg;
              }
              throw new Error(errorMsg);
            }

            const data = await response.json();
            clearInterval(progressTimer);

            if (data.dna && data.insight) {
              setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'completed', progress: 100 } : j));
              if (latestProjectRef.current) {
                setActiveProject({
                  ...latestProjectRef.current,
                  dnaLock: data.dna,
                  directorInsight: data.insight,
                  aiDirectorCompleted: true
                });
              }
            } else if (data.error) {
              throw new Error(data.error);
            }
          } catch (err: any) {
            clearInterval(progressTimer);
            setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'failed', error: err.message || 'Directorial Analysis failed' } : j));
          }
        };

        runScan();
      }

      // 3. SCRIPT GENERATION
      if (job.type === 'script_generation') {
        let simProgress = job.progress;
        const progressTimer = setInterval(() => {
          setJobs(prev => prev.map(j => {
            if (j.id === job.id && j.status === 'running') {
              simProgress = Math.min(90, simProgress + 12);
              return { ...j, progress: simProgress };
            }
            return j;
          }));
        }, 500);

        const runScriptGen = async () => {
          try {
            // Restore arguments
            const storedArgs = localStorage.getItem('hidro_studio_pending_script_args');
            const payloadObj = storedArgs ? JSON.parse(storedArgs) : {};

            const proj = latestProjectRef.current;
            const response = await fetch('/api/script/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                projectName: proj?.name,
                type: proj?.type,
                platform: proj?.platform,
                sceneCount: proj?.sceneCount,
                dnaLock: proj?.dnaLock,
                rawScriptInput: payloadObj.rawText || '',
                mode: payloadObj.mode || 'ai',
              }),
            });

            if (!response.ok) {
              const text = await response.text();
              let errorMsg = 'Screenplay scripting fails';
              try {
                const errJson = JSON.parse(text);
                errorMsg = errJson.error || errorMsg;
              } catch (_) {
                errorMsg = text.length > 150 ? text.substring(0, 150) + '...' : text || errorMsg;
              }
              throw new Error(errorMsg);
            }

            const data = await response.json();
            clearInterval(progressTimer);

            if (data.scenes && Array.isArray(data.scenes)) {
              setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'completed', progress: 100 } : j));
              
              if (latestProjectRef.current) {
                const currentProj = latestProjectRef.current;
                // Incorporate DNA prompts locks
                const injectDNALocks = (narration: string, action: string, visualDir: string) => {
                  const c_dna = currentProj.dnaLock?.CHARACTER_DNA || 'consistent premium character outline';
                  const p_dna = currentProj.dnaLock?.PRODUCT_DNA || 'consistent high-gloss product container';
                  const b_dna = currentProj.dnaLock?.BACKGROUND_DNA || 'cinematic studio ambient staging';
                  const s_dna = currentProj.dnaLock?.STYLE_DNA || 'premium Liquid Glass reflections';
                  const visInspiration = currentProj.directorInsight?.visualDNA || 'anamorphic f/1.2 micro haze';
                  const marketInsight = currentProj.directorInsight?.marketInsight || 'high contrast scrolling';

                  const imagePrompt = `[DNA_LOCKED] CHAR: ${c_dna} | PROD: ${p_dna} | BG: ${b_dna} | STYLE: ${s_dna}. Scene specific: ${action}. Lens: ${visualDir}, ${visInspiration}.`;
                  const videoPrompt = `[PHYSICS] DNA - CHAR: ${c_dna} | PROD: ${p_dna} | BG: ${b_dna} | STYLE: ${s_dna}. Action: ${action}. Camera: ${visualDir}. Focus: ${marketInsight}.`;
                  return { imagePrompt, videoPrompt };
                };

                const processedScenes = data.scenes.map((sc: any, idx: number) => {
                  const { imagePrompt, videoPrompt } = injectDNALocks(sc.narration, sc.action, sc.visualDirection);
                  return {
                    ...sc,
                    sceneNumber: idx + 1,
                    imagePrompt,
                    videoPrompt,
                    cameraPrompt: sc.cameraPrompt || 'Cinematic dolly camera view lens f/1.4',
                    motionPrompt: sc.motionPrompt || 'Water dynamic glass physics',
                    voicePrompt: sc.voicePrompt || 'Deep warm whispering professional narrator',
                    status: 'idle',
                    attempts: 0
                  };
                });

                setActiveProject({
                  ...currentProj,
                  scenes: processedScenes,
                  scriptText: payloadObj.mode === 'paste' ? payloadObj.rawText : 'AI script compiled',
                  scriptingCompleted: true
                });
              }
            } else if (data.error) {
              throw new Error(data.error);
            }
          } catch (err: any) {
            clearInterval(progressTimer);
            setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'failed', error: err.message || 'Script scripting fails' } : j));
          }
        };

        runScriptGen();
      }

      // 4. IMAGE GENERATION (SEQUENTIAL PIPELINE WITH SMART RETRY)
      if (job.type === 'image_generation') {
        let simProgress = job.progress;
        const progressTimer = setInterval(() => {
          setJobs(prev => prev.map(j => {
            if (j.id === job.id && j.status === 'running') {
              simProgress = Math.min(92, simProgress + 15);
              return { ...j, progress: simProgress };
            }
            return j;
          }));
        }, 500);

        const runRenderScene = async () => {
          const currentProj = latestProjectRef.current;
          if (!currentProj) {
            clearInterval(progressTimer);
            return;
          }

          // Locate current scene
          const sceneIndex = currentProj.scenes.findIndex(s => s.id === job.sceneId);
          if (sceneIndex === -1) {
            clearInterval(progressTimer);
            setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'failed', error: 'Associated scene not found in project context' } : j));
            return;
          }

          const targetScene = currentProj.scenes[sceneIndex];

          // Set scene state in project as rendering!
          const renderProjectState = { ...currentProj };
          renderProjectState.scenes[sceneIndex] = {
            ...targetScene,
            status: 'rendering' as const,
            attempts: targetScene.attempts + 1
          };
          setActiveProjectState(renderProjectState);
          safeSaveProject(renderProjectState);

          try {
            console.log(`[BACKGROUND ENGINE] Generating image for Scene ${targetScene.sceneNumber} (Attempt ${targetScene.attempts + 1})...`);
            
            const res = await fetch('/api/image/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                prompt: targetScene.imagePrompt,
                sceneNumber: targetScene.sceneNumber,
              }),
            });

            clearInterval(progressTimer);

            if (!res.ok) throw new Error('Render engine returned error');
            const responseData = await res.json();

            // Set scene status completed
            const completedScene: SceneCard = {
              ...targetScene,
              imageUrl: responseData.imageUrl || generateSyntheticCinematicSvg(targetScene.narration, targetScene.action, targetScene.sceneNumber),
              status: 'completed' as const,
              attempts: targetScene.attempts + 1
            };

            setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'completed', progress: 100 } : j));

            const finalProject = { ...latestProjectRef.current || currentProj };
            finalProject.scenes[sceneIndex] = completedScene;
            // If all scenes completed, mark visuals completed!
            if (finalProject.scenes.every(s => s.status === 'completed')) {
              finalProject.visualsCompleted = true;
            }
            setActiveProject(finalProject);

          } catch (error: any) {
            clearInterval(progressTimer);
            const nextAttempts = targetScene.attempts + 1;
            console.warn(`[BACKGROUND RENDER] Fail. Retries count: ${nextAttempts}/3. Scene ${targetScene.sceneNumber}`);

            if (nextAttempts < 3) {
              // Retry system - keep job alive, increment count and reset status to pending
              setJobs(prev => prev.map(j => {
                if (j.id === job.id) {
                  return {
                    ...j,
                    status: 'pending' as const,
                    progress: 0,
                    attempts: nextAttempts,
                    description: `Retrying rendering sequence (Attempt ${nextAttempts + 1}/3)...`
                  };
                }
                return j;
              }));

              // Reset status on scene level inside project
              const errorProject = { ...latestProjectRef.current || currentProj };
              errorProject.scenes[sceneIndex] = {
                ...targetScene,
                status: 'idle' as const,
                attempts: nextAttempts
              };
              setActiveProjectState(errorProject);
              safeSaveProject(errorProject);

            } else {
              // Mark FAILED on both Job & Scene but KEEP NEXT RUNNING
              setJobs(prev => prev.map(j => {
                if (j.id === job.id) {
                  return {
                    ...j,
                    status: 'failed' as const,
                    progress: 100,
                    error: 'Render maximum attempts limit exhausted.'
                  };
                }
                return j;
              }));

              const failProject = { ...latestProjectRef.current || currentProj };
              failProject.scenes[sceneIndex] = {
                ...targetScene,
                status: 'failed' as const,
                attempts: nextAttempts
              };
              setActiveProject(failProject);
            }
          }
        };

        runRenderScene();
      }

      // 5. PROMPT GENERATION ENGINE (Background Video Prompt Preps - Multi task parallel Pipeline)
      if (job.type === 'prompt_generation') {
        let simProgress = 0;
        const interval = setInterval(() => {
          setJobs(prev => prev.map(j => {
            if (j.id === job.id) {
              simProgress = Math.min(100, simProgress + 35);
              if (simProgress >= 100) {
                clearInterval(interval);
                
                // Add cinematic directions if empty
                if (latestProjectRef.current) {
                  const currentProj = latestProjectRef.current;
                  const sceneIdx = currentProj.scenes.findIndex(s => s.id === job.sceneId);
                  if (sceneIdx !== -1) {
                    const sceneToRefine = currentProj.scenes[sceneIdx];
                    const refinedScene: SceneCard = {
                      ...sceneToRefine,
                      cameraPrompt: sceneToRefine.cameraPrompt || 'Cinematic Dolly zooming slide angle',
                      motionPrompt: sceneToRefine.motionPrompt || 'Fluid glass surface physics, high transparency refractions',
                      voicePrompt: sceneToRefine.voicePrompt || 'High caliber professional voiceover storytelling pitch'
                    };
                    const finalPr = { ...currentProj };
                    finalPr.scenes[sceneIdx] = refinedScene;
                    setActiveProject(finalPr);
                  }
                }

                return { ...j, status: 'completed' as const, progress: 100 };
              }
              return { ...j, progress: simProgress };
            }
            return j;
          }));
        }, 500);

        return () => clearInterval(interval);
      }
    });

  }, [jobs]);

  // Handle stage trigger pipelines
  const triggerAssetAnalysis = (assets: ProjectAssets) => {
    if (!activeProject) return;
    setActiveProject({
      ...activeProject,
      assets
    });
    addJob({
      type: 'asset_analysis',
      title: 'Scuba Scan: Brand Assets',
      description: 'Isolating brand elements and color values for consistent DNA compiling.',
      maxAttempts: 1
    });
  };

  const triggerDirectorAnalysis = () => {
    if (!activeProject) return;
    addJob({
      type: 'director_analysis',
      title: 'AI Director Strategy Scripting',
      description: 'Analysing client metadata, channels, social benchmarks to lock consistent visual guides.',
      maxAttempts: 1
    });
  };

  const triggerScriptGeneration = (payload: { mode: 'ai' | 'paste'; idea?: string; goal?: string; audience?: string; hook?: string; cta?: string; rawText?: string }) => {
    if (!activeProject) return;

    // Temporarily save generation options
    try {
      localStorage.setItem('hidro_studio_pending_script_args', JSON.stringify(payload));
    } catch (e) {
      console.warn('Failed to persist script generation arguments:', e);
    }
    
    addJob({
      type: 'script_generation',
      title: payload.mode === 'paste' ? 'Split Screenplay Cards' : 'Creative Scripting Generator',
      description: payload.mode === 'paste' ? 'Deconstructing raw UGC storyboard script copy.' : 'Drafting marketing acts, hooks, content layouts and DNA prompt bindings in background.',
      maxAttempts: 1
    });
  };

  return (
    <BackgroundQueueContext.Provider
      value={{
        activeProject,
        setActiveProject,
        jobs,
        addJob,
        restartJob,
        cancelJob,
        clearQueue,
        startVisualProduction,
        stopVisualProduction,
        isVisualProductionRunning,
        recoveryNotice,
        dismissRecovery,
        triggerAssetAnalysis,
        triggerDirectorAnalysis,
        triggerScriptGeneration
      }}
    >
      {children}
    </BackgroundQueueContext.Provider>
  );
}
