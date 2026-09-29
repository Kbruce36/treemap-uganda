/** Title row used at the top of each admin page. */
export const AdminPageHeader = ({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) => (
  <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
    <div>
      <h1 className="font-display text-3xl font-black text-primary">{title}</h1>
      {description && <p className="mt-1 text-muted-foreground">{description}</p>}
    </div>
    {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
  </div>
);
