import React from 'react';
import { useSite } from '../hooks/useSite';

const Logo: React.FC<{ className?: string; alt?: string }> = ({ className, alt = 'logo FC.png' }) => {
    const { logoUrl } = useSite();
    return <img src={logoUrl} alt={alt} className={className} />;
};

export default Logo;