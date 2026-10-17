import { Spinner } from "./ui/spinner";
export default function PageLoading({ label = 'Loading page' }: { label?: string }) {
  return (
    <div className="flex min-h-60 w-full items-center justify-center"><Spinner label={label} /></div>
  );
}
