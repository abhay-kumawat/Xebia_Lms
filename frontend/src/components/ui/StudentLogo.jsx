import { motion } from 'framer-motion';
import { cn } from '@/utils';
import { useCatalog } from '@/hooks/useCatalog';

export default function StudentLogo({ className, iconOnly = false, size = 'md' }) {
  let branding = null;

  try {
    const catalog = useCatalog();
    branding = catalog?.branding;
  } catch (e) {
    // Context may not be available
  }

  const companyName = branding?.companyName || 'Xebia Academy';
  
  // Resolve logos to assets provided (Defaulting to light variant since Student portal uses white header/dark sidebar)
  let logoUrl = branding?.lightModeLogo || branding?.headerLogo || branding?.websiteLogo || '/assets/Logo-Purple.png';

  if (!logoUrl || logoUrl.includes('xebia-logo.svg')) {
    logoUrl = '/assets/Logo-Purple.png';
  }

  const heightClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12',
    xl: 'h-16'
  };

  const heightClass = heightClasses[size] || heightClasses.md;

  return (
    <div className={cn('flex items-center gap-3 select-none', className)}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        className={cn('relative flex shrink-0 items-center justify-center cursor-pointer', heightClass)}
      >
        <img 
          src={logoUrl} 
          alt="Xebia" 
          className={cn('w-auto object-contain bg-transparent', heightClass)} 
        />
      </motion.div>

      {!iconOnly && (
        <div className="flex flex-col">
          <span
            className={cn(
              'font-extrabold tracking-tight transition-colors truncate text-white',
              size === 'lg' || size === 'xl' ? 'text-lg' : 'text-sm'
            )}
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {companyName}
          </span>
        </div>
      )}
    </div>
  );
}
