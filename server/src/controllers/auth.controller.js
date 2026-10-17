
import * as authService from '../services/auth.service.js';

export async function login(req, res) {
  const result = await authService.login(req.valid.body);
  res.json({ data: result });
}

export async function me(req, res) {
  const user = await authService.getCurrentUser(req.user.id);
  res.json({ data: { user } });
}