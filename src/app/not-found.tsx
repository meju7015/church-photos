import Link from 'next/link';
import { CameraIcon } from '@/components/icons';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="flex justify-center mb-4 text-[var(--text-sub)]">
          <CameraIcon className="w-12 h-12" />
        </div>
        <h1 className="text-7xl font-extrabold text-primary mb-2">
          404
        </h1>
        <p className="text-lg font-semibold text-[var(--text)] mb-1">페이지를 찾을 수 없어요</p>
        <p className="text-sm text-[var(--text-sub)] mb-8">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있어요
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold text-sm shadow-sm hover:opacity-90 transition-opacity btn-press"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />
          </svg>
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
