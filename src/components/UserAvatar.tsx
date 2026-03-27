import Image from 'next/image';

interface UserAvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  xs: { container: 'w-5 h-5', text: 'text-[9px]' },
  sm: { container: 'w-8 h-8', text: 'text-xs' },
  md: { container: 'w-10 h-10', text: 'text-sm' },
  lg: { container: 'w-16 h-16', text: 'text-2xl' },
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

export default function UserAvatar({ name, avatarUrl, size = 'sm', className = '' }: UserAvatarProps) {
  const s = sizeMap[size];
  const src = avatarUrl ? `${supabaseUrl}/storage/v1/object/public/photo/${avatarUrl}` : null;

  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={64}
        height={64}
        className={`${s.container} rounded-full object-cover shrink-0 ${className}`}
      />
    );
  }

  return (
    <div className={`${s.container} rounded-full bg-[#D1D5DB] dark:bg-[#4B5563] flex items-center justify-center ${s.text} font-bold text-white shrink-0 ${className}`}>
      {name.charAt(0)}
    </div>
  );
}
