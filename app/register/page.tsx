import { RegisterForm } from "@/components/auth/register-form";

export const metadata = {
  title: "Registar - Gestão de Clube Desportivo",
  description: "Crie uma nova conta",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-center text-slate-900 mb-2">
            Clube Desportivo
          </h1>
          <p className="text-center text-slate-600 mb-8">
            Criar Conta
          </p>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
