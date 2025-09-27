import React from 'react';

interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

interface EmptyStateProps {
  title: string;
  description?: string;
  actionPrimary?: EmptyStateAction;
  actionSecondary?: EmptyStateAction;
  icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionPrimary,
  actionSecondary,
  icon,
}) => {
  return (
    <div className="col-span-full text-center py-14 card-gradient">
      <div className="flex flex-col items-center">
        {icon && (
          <div className="mb-3 text-blue-500">{icon}</div>
        )}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        {description && (
          <p className="text-gray-500 max-w-xl mx-auto mb-5">{description}</p>
        )}
        <div className="flex items-center gap-3 justify-center">
          {actionPrimary && (
            <button
              type="button"
              onClick={actionPrimary.onClick}
              className={`btn-primary px-5 py-2 rounded-lg ${actionPrimary.variant === 'secondary' ? 'btn-secondary' : ''}`}
              aria-label={actionPrimary.label}
            >
              {actionPrimary.label}
            </button>
          )}
          {actionSecondary && (
            <button
              type="button"
              onClick={actionSecondary.onClick}
              className={`btn-secondary px-5 py-2 rounded-lg ${actionSecondary.variant === 'primary' ? 'btn-primary' : ''}`}
              aria-label={actionSecondary.label}
            >
              {actionSecondary.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmptyState;


