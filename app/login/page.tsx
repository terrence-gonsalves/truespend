import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="w-full max-w-md space-y-8 px-4">
                <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                    Welcome to TrueSpend
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                    Sign in to manage your budget
                </p>
                </div>
                <LoginForm />
            </div>
        </div>
    )
}