export type CoursePlaylist = {
  id: string;
  title: string;
  category: string;
  youtube_url: string;
  playlist_id: string;
  first_video_id: string | null;
  playlist_order: number;
};

export type CourseVideo = {
  id: string;
  playlistId: string;
  title: string;
  module: string;
  duration: string;
  order: number;
  videoId: string;
};

export const defaultCoursePlaylists: CoursePlaylist[] = [{
  id: "abdigurey-main-playlist",
  title: "Basic Forex | TET Community",
  category: "Beginner course",
  youtube_url: "https://www.youtube.com/watch?v=JpGa3HA2FNo&list=PLBU5Z3Sx17L8&index=1",
  playlist_id: "PLBU5Z3Sx17L8",
  first_video_id: "JpGa3HA2FNo",
  playlist_order: 1,
},
{
  id: "tet-weekly-recap-playlist",
  title: "Weekly Recap",
  category: "Market recap",
  youtube_url: "https://www.youtube.com/watch?v=wojBgf3a1Tk&list=PL8bTfti1zCLm6eWi57a11l5WHlchQrGWu&index=1",
  playlist_id: "PL8bTfti1zCLm6eWi57a11l5WHlchQrGWu",
  first_video_id: "wojBgf3a1Tk",
  playlist_order: 2,
},
{
  id: "tet-2026-mentorship-playlist",
  title: "2026 mentorship TET Community",
  category: "Mentorship course",
  youtube_url: "https://www.youtube.com/watch?v=JcrfDQyKdkI&list=PL8bTfti1zCLnMlw8nlUE7AuAtRcz8zaad&index=1",
  playlist_id: "PL8bTfti1zCLnMlw8nlUE7AuAtRcz8zaad",
  first_video_id: "JcrfDQyKdkI",
  playlist_order: 3,
}];

export const defaultCourseVideos: CourseVideo[] = [
  { id: "basic-forex-01", playlistId: "PLBU5Z3Sx17L8", title: "01 Basic : Waa maxay Forex", module: "Forex foundation", duration: "31:06", order: 1, videoId: "JpGa3HA2FNo" },
  { id: "basic-forex-02", playlistId: "PLBU5Z3Sx17L8", title: "02 Basic : CANDLE INFORMATION & PO3", module: "Candles and PO3", duration: "35:56", order: 2, videoId: "vWCID2MeaHo" },
  { id: "basic-forex-03", playlistId: "PLBU5Z3Sx17L8", title: "03 Basic : KILLZONES", module: "Trading sessions", duration: "37:17", order: 3, videoId: "sjXV_ODG1No" },
  { id: "basic-forex-04", playlistId: "PLBU5Z3Sx17L8", title: "04 Basic : KEY LEVELS", module: "Market structure", duration: "55:05", order: 4, videoId: "eZn4KUzLTLw" },
  { id: "basic-forex-05", playlistId: "PLBU5Z3Sx17L8", title: "05 Basic : Liquidity & SMT", module: "Liquidity concepts", duration: "26:07", order: 5, videoId: "-T-abFDwQ9c" },
  { id: "basic-forex-06", playlistId: "PLBU5Z3Sx17L8", title: "06 Basic: The path to TET MODEL", module: "TET model path", duration: "24:18", order: 6, videoId: "7F-o1kB0Z_c" },
  { id: "weekly-recap-01", playlistId: "PL8bTfti1zCLm6eWi57a11l5WHlchQrGWu", title: "Weekly Recap Week4 June", module: "Weekly recap", duration: "1:02:54", order: 1, videoId: "wojBgf3a1Tk" },
  { id: "weekly-recap-02", playlistId: "PL8bTfti1zCLm6eWi57a11l5WHlchQrGWu", title: "Weekly Recap week 3 MAY", module: "Weekly recap", duration: "1:03:44", order: 2, videoId: "77djRoX1Uxc" },
  { id: "weekly-recap-03", playlistId: "PL8bTfti1zCLm6eWi57a11l5WHlchQrGWu", title: "Trade recap 08 june", module: "Trade recap", duration: "35:51", order: 3, videoId: "8AYVwHQkkN4" },
  { id: "mentorship-2026-01", playlistId: "PL8bTfti1zCLnMlw8nlUE7AuAtRcz8zaad", title: "Introduction - 2026 FREE MENTORSHIP", module: "Introduction", duration: "6:46", order: 1, videoId: "JcrfDQyKdkI" },
  { id: "mentorship-2026-02", playlistId: "PL8bTfti1zCLnMlw8nlUE7AuAtRcz8zaad", title: "1.0 Institutional OrderFlow | 2026 Mentorship | TET Community", module: "OrderFlow", duration: "23:06", order: 2, videoId: "1e7n4AMm0dA" },
  { id: "mentorship-2026-03", playlistId: "PL8bTfti1zCLnMlw8nlUE7AuAtRcz8zaad", title: "2.0 IRL to ERL & 3.0 Key Levels | 2026 Mentorship", module: "IRL, ERL, key levels", duration: "22:30", order: 3, videoId: "Dc5xOWHFPw8" },
  { id: "mentorship-2026-04", playlistId: "PL8bTfti1zCLnMlw8nlUE7AuAtRcz8zaad", title: "4.0 CANDLE RANGE THEORY ( CRT) | 2026 Mentorship", module: "CRT", duration: "56:48", order: 4, videoId: "ELUb-AIxC88" },
  { id: "mentorship-2026-05", playlistId: "PL8bTfti1zCLnMlw8nlUE7AuAtRcz8zaad", title: "5.0 Daily Profiles and Purging Hours | 2026 Mentorship", module: "Daily profiles", duration: "38:36", order: 5, videoId: "eVCXokhMUPs" },
  { id: "mentorship-2026-06", playlistId: "PL8bTfti1zCLnMlw8nlUE7AuAtRcz8zaad", title: "6.0 ADVANCED SMT & PSP | 2026 mentorship", module: "SMT and PSP", duration: "25:59", order: 6, videoId: "TH2R803mjQE" },
  { id: "mentorship-2026-07", playlistId: "PL8bTfti1zCLnMlw8nlUE7AuAtRcz8zaad", title: "7.0 ENTRY MODEL | 2026 Mentorship", module: "Entry model", duration: "17:50", order: 7, videoId: "2nOW8N6nAgs" },
  { id: "mentorship-2026-08", playlistId: "PL8bTfti1zCLnMlw8nlUE7AuAtRcz8zaad", title: "08. Risk Management & MT5 | 2026 Mentorship TET", module: "Risk management", duration: "33:01", order: 8, videoId: "S-jy5CvK8IU" },
  { id: "mentorship-2026-09", playlistId: "PL8bTfti1zCLnMlw8nlUE7AuAtRcz8zaad", title: "09 THE EDGE | 2026 MENTORSHIP", module: "The edge", duration: "2:09:25", order: 9, videoId: "BY5tdw6Gnjc" },
  { id: "mentorship-2026-10", playlistId: "PL8bTfti1zCLnMlw8nlUE7AuAtRcz8zaad", title: "The 10% Edge | TET MODEL", module: "TET model", duration: "40:45", order: 10, videoId: "-r7KdbCKDds" },
  { id: "mentorship-2026-11", playlistId: "PL8bTfti1zCLnMlw8nlUE7AuAtRcz8zaad", title: "Mastering the 1H TSQ & Key Timing | Tet Community", module: "1H TSQ", duration: "57:48", order: 11, videoId: "Y7fOO97hbns" },
];
