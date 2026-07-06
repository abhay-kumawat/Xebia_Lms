import React from 'react';

export default function Button({ children, onClick, type = 'button', variant = 'primary', style = {}, ...props }) {
  const className = `btn btn-${variant}`;
  return (
    <button type={type} onClick={onClick} className={className} style={style} {...props}>
      {children}
    </button>
  );
}
