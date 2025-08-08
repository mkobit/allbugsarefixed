import type { FC, PropsWithChildren } from 'react';

type CalloutType = 'info' | 'warning' | 'danger';

interface CalloutProps extends PropsWithChildren {
  type: CalloutType;
}

const calloutStyles: Record<CalloutType, React.CSSProperties> = {
  info: {
    borderLeft: '4px solid #3b82f6',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
  },
  warning: {
    borderLeft: '4px solid #f59e0b',
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  danger: {
    borderLeft: '4px solid #ef4444',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
};

const Callout: FC<CalloutProps> = ({ type, children }) => {
  const style = {
    padding: '1rem',
    margin: '1rem 0',
    ...calloutStyles[type],
  };

  return (
    <div style={style}>
      {children}
    </div>
  );
};

export default Callout;
