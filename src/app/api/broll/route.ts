import { NextResponse } from "next/server";
import type { BRollClip } from "@/lib/types";

// TODO: Integrate Pexels API for real B-roll footage
// import { createClient } from "pexels";
// const pexelsClient = createClient(process.env.PEXELS_API_KEY!);

/**
 * Generate mock B-roll results with Pexels-style placeholder data.
 * Each keyword yields 3-5 clips with realistic metadata.
 */
function generateMockBRoll(keyword: string): BRollClip[] {
  const mockData: Record<string, { photographer: string; id: string }[]> = {
    default: [
      { photographer: "Cottonbro Studio", id: "default-1" },
      { photographer: "Mikhail Nilov", id: "default-2" },
      { photographer: "Tima Miroshnichenko", id: "default-3" },
      { photographer: "Rodnae Productions", id: "default-4" },
    ],
  };

  const photographers = mockData.default;
  const slug = keyword.toLowerCase().replace(/\s+/g, "-");

  return photographers.map((p, index) => ({
    id: `broll-${slug}-${index + 1}`,
    keyword,
    url: `https://player.vimeo.com/external/placeholder-${slug}-${index + 1}.hd.mp4`,
    thumbnail: `https://images.pexels.com/videos/placeholder/${slug}-${index + 1}/free-video-thumbnail.jpg`,
    duration: [3, 5, 4, 6][index] || 4,
    source: "pexels" as const,
    photographer: p.photographer,
  }));
}

/**
 * Fetch B-roll clips from the Pexels API.
 * Falls back to mock data if the API key is not configured or the request fails.
 */
async function fetchPexelsBRoll(keyword: string): Promise<BRollClip[]> {
  const apiKey = process.env.PEXELS_API_KEY;

  if (!apiKey) {
    return generateMockBRoll(keyword);
  }

  try {
    const response = await fetch(
      `https://api.pexels.com/videos/search?query=${encodeURIComponent(keyword)}&per_page=5&orientation=portrait`,
      {
        headers: {
          Authorization: apiKey,
        },
      }
    );

    if (!response.ok) {
      console.error(`Pexels API error: ${response.status} ${response.statusText}`);
      return generateMockBRoll(keyword);
    }

    const data = await response.json();

    if (!data.videos || data.videos.length === 0) {
      return generateMockBRoll(keyword);
    }

    return data.videos.map(
      (video: {
        id: number;
        duration: number;
        user: { name: string };
        image: string;
        video_files: { link: string; quality: string }[];
      }) => {
        // Prefer HD quality video file
        const videoFile =
          video.video_files.find((f) => f.quality === "hd") ||
          video.video_files[0];

        return {
          id: `pexels-${video.id}`,
          keyword,
          url: videoFile?.link || "",
          thumbnail: video.image,
          duration: video.duration,
          source: "pexels" as const,
          photographer: video.user.name,
        };
      }
    );
  } catch (error) {
    console.error("Failed to fetch from Pexels API:", error);
    return generateMockBRoll(keyword);
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get("keyword");

    if (!keyword || keyword.trim().length === 0) {
      return NextResponse.json(
        { error: "Missing required query parameter 'keyword'." },
        { status: 400 }
      );
    }

    const trimmedKeyword = keyword.trim();

    if (trimmedKeyword.length > 100) {
      return NextResponse.json(
        { error: "Keyword exceeds maximum length of 100 characters." },
        { status: 400 }
      );
    }

    const clips = await fetchPexelsBRoll(trimmedKeyword);

    return NextResponse.json(clips);
  } catch (error) {
    console.error("Error fetching B-roll:", error);
    return NextResponse.json(
      { error: "Failed to fetch B-roll clips. Please try again." },
      { status: 500 }
    );
  }
}
