/**
 * Last-known public content bundled with the site. It lets the public pages
 * remain useful while the hosted API wakes up, then is replaced by fresh API
 * data in the background. Keep these records in sync when publishing a major
 * event or past-event record.
 */
export const publicContentFallback = {
  announcements: [],
  events: [
    {
      _id: 'fallback-event-think-architecture-together-s1',
      title: 'Think Architecture Together S1',
      speaker: 'Prabin Kumar Sabat',
      date: '2026-08-22T00:00:00.000Z',
      time: '15:10',
      location: '1st Mtech Lab',
      description: "Conceptual Problem Solving on: Amdahl's Law, Redundancy, MTTF",
    },
  ],
  pastEvents: [
    {
      _id: 'fallback-past-event-risc-v',
      date: '2026-03-14',
      title: 'Introduction to RISC-V',
      reportLink: 'https://drive.google.com/file/d/10wleYWLHt7ZzuetHX6vbsYzymlVMyylc/view?usp=drive_link',
      resourcesLink: 'https://drive.google.com/drive/folders/12OaNlxOvdvNgvXi5NSB9fNLMJCpYFZUD?usp=drive_link',
    },
    {
      _id: 'fallback-past-event-kernel-space',
      date: '2025-12-19',
      title: 'From Kernel Space to Wine',
      reportLink: 'https://drive.google.com/file/d/133TsoKKZpf-YA_NmQ8v2Ixf3xapUMN2b/view?usp=drive_link',
      resourcesLink: 'https://drive.google.com/drive/folders/1EYc41zAsM8R-5Ar0Vb4vjmG8gjO4i4yT?usp=drive_link',
    },
  ],
};
