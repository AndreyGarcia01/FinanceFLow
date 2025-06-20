import { PiggyBank } from 'lucide-react';

export default function Header() {
  return (
    <header className="py-6">
      <div className="container mx-auto flex items-center space-x-3">
        <PiggyBank className="h-10 w-10 text-primary" />
        <h1 className="text-4xl font-headline font-bold text-primary">
          FinanceFlow
        </h1>
      </div>
    </header>
  );
}
