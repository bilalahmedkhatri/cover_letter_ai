import { Button } from "./button";
export function IconButton({
  label,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "size"> & { label: string }) {
  return <Button size="icon" aria-label={label} title={label} {...props} />;
}
