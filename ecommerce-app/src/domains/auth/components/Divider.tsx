interface DividerProps {
  text: string;
}

export function Divider({ text }: DividerProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0' }}>
      <div style={{ flex: '1', height: '1px', background: '#e9ecef' }}></div>
      <span style={{ padding: '0 16px', fontSize: '14px', color: '#666' }}>{text}</span>
      <div style={{ flex: '1', height: '1px', background: '#e9ecef' }}></div>
    </div>
  );
}
