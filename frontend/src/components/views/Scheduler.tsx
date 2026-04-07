import { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';

interface ScheduledPost {
  id: string;
  platform: 'linkedin' | 'twitter' | 'instagram' | 'facebook' | 'tiktok';
  content: string;
  date: string;
  time: string;
}

const mockScheduledPosts: ScheduledPost[] = [
  {
    id: '1',
    platform: 'linkedin',
    content: '🚀 Exciting news about our product launch...',
    date: '2024-03-20',
    time: '09:00',
  },
  {
    id: '2',
    platform: 'twitter',
    content: 'Thread about productivity tips 🧵',
    date: '2024-03-22',
    time: '14:30',
  },
];

const platformOptions = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'twitter', label: 'Twitter' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'tiktok', label: 'TikTok' },
];

export default function Scheduler() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('linkedin');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [content, setContent] = useState('');

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getPostsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return mockScheduledPosts.filter((post) => post.date === dateStr);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Content Scheduler</h1>
          <p className="text-gray-400">Plan and schedule your content across all platforms</p>
        </div>
        <Button
          variant="primary"
          icon={<CalendarIcon className="w-4 h-4" />}
          onClick={() => setShowScheduleForm(!showScheduleForm)}
        >
          Schedule Post
        </Button>
      </div>

      {showScheduleForm && (
        <Card>
          <h3 className="text-lg font-semibold text-white mb-4">Schedule New Post</h3>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter your content..."
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Platform"
                options={platformOptions}
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
              />
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
                <input
                  type="date"
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-gray-600 transition-colors"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Time</label>
                <input
                  type="time"
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-gray-600 transition-colors"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setShowScheduleForm(false)}>
                Cancel
              </Button>
              <Button variant="primary">Schedule</Button>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">{monthName}</h2>
          <div className="flex gap-2">
            <button
              onClick={previousMonth}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}

          {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const posts = getPostsForDate(day);
            const isToday =
              day === new Date().getDate() &&
              currentDate.getMonth() === new Date().getMonth() &&
              currentDate.getFullYear() === new Date().getFullYear();

            return (
              <div
                key={day}
                className={`aspect-square p-2 border border-gray-800 rounded-lg hover:border-gray-700 transition-colors ${
                  isToday ? 'bg-gray-900' : ''
                }`}
              >
                <div className="text-sm text-gray-400 mb-1">{day}</div>
                <div className="space-y-1">
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      className="text-xs p-1 bg-gray-800 rounded cursor-pointer hover:bg-gray-700 transition-colors"
                    >
                      <Badge variant={post.platform} className="text-[10px] px-1 py-0">
                        {post.platform.slice(0, 2).toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Upcoming Posts</h3>
        <div className="space-y-3">
          {mockScheduledPosts.map((post) => (
            <Card key={post.id} hover>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={post.platform}>{post.platform.toUpperCase()}</Badge>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {new Date(post.date).toLocaleDateString()} at {post.time}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300">{post.content}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">Edit</Button>
                  <Button variant="ghost" size="sm">Delete</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
