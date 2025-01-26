import { DiaryEntryResponse } from '@/types/diary';

interface DiaryEntriesProps {
  entries: (DiaryEntryResponse & { isLoading?: boolean })[];
}

export default function DiaryEntries({ entries }: DiaryEntriesProps) {
  return (
    <div className="bg-[#fdfaf7] rounded-lg shadow-lg p-8 border border-[#e8e1d9]">
      <div className="space-y-16">
        {entries.map((entry) => (
          <div key={entry.id} className="relative">
            {/* Decorative elements */}
            <div className="absolute -left-4 top-0 h-full w-[2px] bg-gradient-to-b from-amber-200 via-amber-100 to-amber-200"></div>
            <div className="absolute -left-6 top-8 w-4 h-4 rounded-full bg-amber-200 shadow-inner"></div>

            {/* Title and Date Header */}
            <div className="mb-6">
              <h2 className="font-handwriting text-2xl text-amber-800 mb-1">Dear Diary,</h2>
              <p className="font-handwriting text-sm text-amber-600 italic">
                {new Date(entry.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            {/* Content Section */}
            <div className="mb-8 pl-2">
              <p className="font-handwriting text-lg leading-relaxed text-gray-800 whitespace-pre-wrap">
                {entry.content}
              </p>
            </div>

            {/* Single Image Section */}
            <div className="pl-2">
              <div className="aspect-square w-2/3 mx-auto relative">
                {entry.isLoading ? (
                  <div className="w-full h-full flex items-center justify-center border-2 border-amber-200 rounded-lg bg-[#fdfaf7]">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-2"></div>
                      <p className="font-handwriting text-amber-600">Capturing this moment...</p>
                    </div>
                  </div>
                ) : (
                  <div className="transform rotate-1 hover:rotate-0 transition-transform duration-300">
                    <img
                      src={entry.imageUrl}
                      alt="Generated from entry"
                      className="rounded-lg w-full h-full object-contain border-4 border-white shadow-xl"
                      loading="lazy"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Decorative bottom line */}
            <div className="mt-12 border-b border-dashed border-amber-200"></div>
          </div>
        ))}
      </div>
    </div>
  );
} 