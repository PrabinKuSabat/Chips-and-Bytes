import { act, fireEvent, render, screen } from '@testing-library/react';
import AboutPage from './components/Pages/AboutPage';
import BlogCard from './components/BlogCard/BlogCard';
import CinematicHero from './components/CinematicHero/CinematicHero';
import ContactPage from './components/Pages/ContactPage';
import ProjectCard from './components/ProjectCard/ProjectCard';
import LiveSessions from './components/LiveSessions/LiveSessions';
import Navbar from './components/Navbar/Navbar';
import NewsPage from './components/Pages/NewsPage';

jest.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: '/' }),
  Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>,
}), { virtual: true });

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
  window.sessionStorage.clear();
  document.documentElement.classList.remove('welcome-app-ready');
  document.getElementById('welcome-bootstrap')?.remove();
});

test('preserves the original club writing', () => {
  render(<AboutPage />);

  expect(screen.getByRole('heading', { name: 'What We Do' })).toBeInTheDocument();
  expect(screen.getByText(/Foster self-driven learning/i)).toBeInTheDocument();
});

test('shows a visible Medium destination on every blog card', () => {
  render(
    <BlogCard
      blog={{
        url: 'https://medium.com/@chips-and-bytes/example',
        title: 'Example architecture article',
        description: 'A systems article.',
        category: 'Architecture',
        accent: 'cpu',
      }}
      index={0}
      linkClassName="blog-read-link"
      actionLabel="Read Article"
    />,
  );

  const link = screen.getByRole('link', { name: /Example architecture article on Medium/i });
  expect(link).toHaveAttribute('href', 'https://medium.com/@chips-and-bytes/example');
  expect(screen.getByText('medium.com')).toBeInTheDocument();
});

test('shows a visible GitHub destination on project cards', () => {
  render(
    <ProjectCard
      project={{
        url: 'https://github.com/PrabinKuSabat/example',
        title: 'Example architecture project',
        description: 'An open-source systems project.',
      }}
    />,
  );

  const link = screen.getByRole('link', { name: /View Example architecture project repository on GitHub/i });
  expect(link).toHaveAttribute('href', 'https://github.com/PrabinKuSabat/example');
  expect(screen.getByText('github.com')).toBeInTheDocument();
});

test('keeps the contact panel focused on the club identity', () => {
  render(<ContactPage />);

  expect(screen.getByRole('img', { name: 'Chips & Bytes' })).toHaveAttribute('src', '/assets/logo_white_full.png');
  expect(screen.queryByText(/Start a conversation/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/Build, study and think architecture together/i)).not.toBeInTheDocument();
});

test('uses an accessible compact header menu and closes it after five seconds', () => {
  jest.useFakeTimers();

  const { unmount } = render(
    <Navbar activeTab="home" setActiveTab={jest.fn()} navigate={jest.fn()} />,
  );

  const menuButton = screen.getByRole('button', { name: /site navigation/i });
  expect(screen.queryByText('Computer Architecture Club')).not.toBeInTheDocument();
  expect(menuButton).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByRole('button', { name: 'Blogs' })).toHaveAttribute('tabindex', '0');
  expect(screen.getByRole('button', { name: 'About' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'News' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Contact' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'About Us' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Contact Us' })).not.toBeInTheDocument();

  act(() => jest.advanceTimersByTime(4999));
  expect(menuButton).toHaveAttribute('aria-expanded', 'true');

  act(() => jest.advanceTimersByTime(1));
  expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  expect(screen.getByRole('button', { name: 'Blogs', hidden: true })).toHaveAttribute('tabindex', '-1');

  fireEvent.click(menuButton);
  expect(menuButton).toHaveAttribute('aria-expanded', 'true');

  act(() => jest.advanceTimersByTime(5000));
  expect(menuButton).toHaveAttribute('aria-expanded', 'false');

  fireEvent.mouseEnter(menuButton.closest('.nav-disclosure'));
  expect(menuButton).toHaveAttribute('aria-expanded', 'true');

  unmount();
  jest.useRealTimers();
});

test('shows only the current dated news edition with numbered headings and reading links', () => {
  const now = new Date();
  const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  window.localStorage.setItem(`chips-and-bytes:public-resource:news-${dateKey}`, JSON.stringify({
    savedAt: Date.now(),
    value: [
      { _id: 'one', heading: 'A new processor arrives', summary: 'Why its cache hierarchy matters.' },
      { _id: 'two', heading: 'An AI systems update', summary: 'The architecture implication in brief.' },
    ],
  }));

  render(<NewsPage />);

  expect(screen.getByRole('heading', { name: 'News' })).toBeInTheDocument();
  expect(screen.getByText('01')).toBeInTheDocument();
  expect(screen.getByText('02')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'A new processor arrives' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Read today’s complete note/i })).toHaveAttribute('href', `/news/${dateKey}`);
  expect(screen.getByRole('link', { name: /Browse all news/i })).toHaveAttribute('href', '/news');
});

test('opens with the requested welcome and retains the original hero copy', () => {
  const bootstrap = document.createElement('div');
  bootstrap.id = 'welcome-bootstrap';
  document.body.appendChild(bootstrap);
  const { container, unmount } = render(<CinematicHero onJoin={jest.fn()} />);

  expect(screen.getByRole('status', { name: 'Welcome to Chips and Bytes' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /Explore the world of Computer Architecture/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Join Our Community' })).toBeInTheDocument();
  const heroImages = [
    '/assets/hero/zen2-matisse-die.webp',
    '/assets/hero/silicon-wafer-closeup.webp',
    '/assets/hero/nvidia-gp100-die.webp',
    '/assets/hero/processor-grid-macro.webp',
    '/assets/hero/intel-i9-13900k-die.webp',
    '/assets/hero/circuit-board-macro.webp',
    '/assets/hero/amd-epyc-rome-io-die.webp',
    '/assets/hero/golden-processor-die.webp',
    '/assets/hero/exposed-processor-die.webp',
    '/assets/hero/blue-processor-die.webp',
    '/assets/hero/development-board-top.webp',
    '/assets/hero/orange-processor-die.webp',
    '/assets/hero/silicon-wafer-macro-secondary.webp',
    '/assets/hero/angled-rainbow-die.webp',
    '/assets/hero/wafer-die-pattern.webp',
  ];

  expect(container.querySelectorAll('.cinematic-frame')).toHaveLength(heroImages.length);
  heroImages.forEach((src) => {
    expect(container.querySelector(`img[src="${src}"]`)).toBeInTheDocument();
  });
  expect(screen.queryByText('Microprocessors')).not.toBeInTheDocument();
  expect(screen.queryByText(/Hardware:/i)).not.toBeInTheDocument();
  expect(container.querySelector('.welcome-sequence__rule')).not.toBeInTheDocument();
  expect(document.documentElement).toHaveClass('welcome-app-ready');
  unmount();
});

test('keeps multiple structured sessions individually readable and navigable', () => {
  render(
    <LiveSessions
      sessions={[
        {
          _id: 'one',
          title: 'Think Architecture Together S1',
          date: '2026-08-22T00:00:00.000Z',
          time: '15:10',
          location: '1st Mtech Lab',
          description: 'Conceptual problem solving on Amdahl’s Law and redundancy.',
        },
        {
          _id: 'two',
          title: 'QEMU Lab: Tracing a Boot Sequence',
          date: '2026-08-29T00:00:00.000Z',
          time: '11:00',
          location: 'Systems Studio',
          description: 'Trace the startup path from firmware to a running kernel.',
        },
      ]}
    />,
  );

  expect(screen.getByRole('heading', { name: 'Upcoming Sessions' })).toBeInTheDocument();
  expect(screen.getByText('Next on the calendar')).toBeInTheDocument();
  expect(screen.getByText('Think Architecture Together S1')).toBeInTheDocument();
  expect(screen.getByText('QEMU Lab: Tracing a Boot Sequence')).toBeInTheDocument();
  expect(screen.getByText('1st Mtech Lab')).toBeInTheDocument();
  expect(screen.getByText(/Conceptual problem solving/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Previous live session' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Next live session' })).toBeInTheDocument();
});

test('keeps legacy announcement sessions readable while events are being introduced', () => {
  render(<LiveSessions sessions={[{ _id: 'legacy', text: 'QEMU lab announcement' }]} />);

  expect(screen.getByText('QEMU lab announcement')).toBeInTheDocument();
  expect(screen.getByText('Scheduled session')).toBeInTheDocument();
});
