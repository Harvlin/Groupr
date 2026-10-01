import { useState, useMemo, FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { ButtonPrimaryHero } from '@/components/ui/DesignButtons';
import { useAuth } from '@/hooks/useAuth';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function RegisterPage() {
  useDocumentTitle('Create account');
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const validate = (field: string, value: string) => {
    switch (field) {
      case 'name':
        return !value.trim() ? 'Name is required' : '';
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!value.includes('@')) return 'Please enter a valid email';
        return '';
      case 'password':
        return value.length < 8
          ? 'Password must be at least 8 characters'
          : '';
      case 'confirm':
        return value !== password ? "Passwords don't match" : '';
      default:
        return '';
    }
  };

  const handleBlur = (field: string, value: string) => {
    setErrors((prev) => ({ ...prev, [field]: validate(field, value) }));
  };

  const criteria = useMemo(
    () => [
      password.length >= 8,
      /\d/.test(password),
      /[!@#$%^&*(),.?":{}|<>]/.test(password),
      password.length >= 12,
    ],
    [password]
  );
  const metCount = criteria.filter(Boolean).length;

  const strengthColor =
    metCount <= 1
      ? 'bg-accent-warning'
      : metCount === 2
        ? 'bg-accent-medium'
        : metCount === 3
          ? 'bg-accent-positive'
          : 'bg-accent-lime';

  const isFormValid =
    !errors.name &&
    !errors.email &&
    !errors.password &&
    !errors.confirm &&
    name.trim() &&
    email.includes('@') &&
    password.length >= 8 &&
    confirm === password;

  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const nextErrors = {
      name: validate('name', name),
      email: validate('email', email),
      password: validate('password', password),
      confirm: validate('confirm', confirm),
    };
    setErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) return;

    setSubmitError('');
    setLoading(true);
    try {
      await register(name, email, password, role);
      // Pass inviteToken forward to onboarding if it exists
      const inviteToken = (location.state as any)?.inviteToken;
      navigate('/onboarding', { state: { inviteToken }, replace: true });
    } catch {
      setSubmitError('Could not create account. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-muted px-4 py-12 font-body">
      <div className="w-full max-w-md rounded-card bg-white p-8 shadow-hairline">
        <Link to="/" className="font-display text-2xl text-text-primary">
          Groupr
        </Link>

        <h1 className="mt-6 text-2xl font-semibold text-text-primary">
          Create your account
        </h1>
        <p className="mt-2 text-base text-text-secondary">
          Free for students and teachers.
        </p>

        {submitError && (
          <div className="mt-6 rounded-card border border-accent-warning bg-accent-warning/10 px-4 py-3 text-sm text-accent-warning">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-text-primary"
            >
              Full name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={(e) => handleBlur('name', e.target.value)}
              placeholder="Your full name"
              className="mt-1.5 block w-full rounded-control border border-black/10 bg-white px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent-lime focus:outline-none"
            />
            {errors.name && (
              <p className="mt-1.5 text-[13px] text-accent-warning">
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-text-primary"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={(e) => handleBlur('email', e.target.value)}
              placeholder="you@school.edu"
              className="mt-1.5 block w-full rounded-control border border-black/10 bg-white px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent-lime focus:outline-none"
            />
            {errors.email && (
              <p className="mt-1.5 text-[13px] text-accent-warning">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-text-primary"
            >
              Password
            </label>
            <div className="relative mt-1.5">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={(e) => handleBlur('password', e.target.value)}
                placeholder="••••••••"
                className="block w-full rounded-control border border-black/10 bg-white px-4 py-2.5 pr-10 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent-lime focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-[13px] text-accent-warning">
                {errors.password}
              </p>
            )}

            <div className="mt-3 flex gap-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full ${
                    i < metCount ? strengthColor : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="confirm"
              className="block text-sm font-medium text-text-primary"
            >
              Confirm password
            </label>
            <input
              id="confirm"
              type={showPassword ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              onBlur={(e) => handleBlur('confirm', e.target.value)}
              placeholder="••••••••"
              className="mt-1.5 block w-full rounded-control border border-black/10 bg-white px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent-lime focus:outline-none"
            />
            {errors.confirm && (
              <p className="mt-1.5 text-[13px] text-accent-warning">
                {errors.confirm}
              </p>
            )}
          </div>

          <div>
            <span className="block text-sm font-medium text-text-primary">
              Role
            </span>
            <div className="mt-1.5 flex rounded-control bg-black/[0.03] p-1">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`flex-1 rounded-control py-2 text-sm font-medium transition-colors ${
                  role === 'student'
                    ? 'bg-accent-lime text-surface-forest'
                    : 'border border-black/10 bg-white text-text-secondary'
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setRole('teacher')}
                className={`flex-1 rounded-control py-2 text-sm font-medium transition-colors ${
                  role === 'teacher'
                    ? 'bg-accent-lime text-surface-forest'
                    : 'border border-black/10 bg-white text-text-secondary'
                }`}
              >
                Teacher
              </button>
            </div>
          </div>

          <ButtonPrimaryHero
            type="submit"
            className="w-full"
            disabled={!isFormValid || loading}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-surface-forest border-t-transparent" />
                Creating account…
              </span>
            ) : (
              'Create account'
            )}
          </ButtonPrimaryHero>
        </form>

        <div className="mt-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-black/10" />
          <span className="text-sm text-text-tertiary">or</span>
          <div className="h-px flex-1 bg-black/10" />
        </div>

        <button
          type="button"
          className="mt-6 inline-flex w-full items-center gap-3 rounded-control bg-white px-5 py-2.5 shadow-hairline transition-colors hover:bg-surface-muted"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="text-base font-medium text-text-primary">
            Continue with Google
          </span>
        </button>

        <p className="mt-8 text-center text-sm text-text-secondary">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-accent-blue hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
