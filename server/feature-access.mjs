import { publicWorkflows, workflows } from '../services/workflow.mjs';

// Server-only policy: callers supply the identity returned by Neon, never request data.
export function availableWorkflows(user, env = process.env) {
  const developer = Boolean(user?.id && user.emailVerified === true && user.email?.toLowerCase() === 'bilal.cloudscourt@gmail.com');
  return user?.id && (env.NODE_ENV === 'development' || developer) ? Object.keys(workflows) : [...publicWorkflows];
}
export const canUseWorkflow = (workflow, user, env = process.env) => availableWorkflows(user, env).includes(workflow);
