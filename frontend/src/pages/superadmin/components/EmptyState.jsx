import { Button } from "../../../components/ui/button";

function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-300 bg-white/70 p-8 text-center text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-950/60 dark:text-gray-300">
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      {description && <p className="max-w-sm text-sm text-gray-500 dark:text-gray-400">{description}</p>}
      {actionLabel && (
        <Button type="button" variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
