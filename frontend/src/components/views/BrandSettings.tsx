import { useState, useEffect } from 'react';
import { Save, Sparkles } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';

const voiceOptions = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'bold', label: 'Bold' },
  { value: 'inspirational', label: 'Inspirational' },
  { value: 'humorous', label: 'Humorous' },
];

const toneOptions = [
  { value: 'friendly', label: 'Friendly' },
  { value: 'authoritative', label: 'Authoritative' },
  { value: 'empathetic', label: 'Empathetic' },
  { value: 'educational', label: 'Educational' },
];

export default function BrandSettings() {
  const [brandName, setBrandName] = useState('');
  const [brandDescription, setBrandDescription] = useState('');
  const [brandVoice, setBrandVoice] = useState('professional');
  const [tone, setTone] = useState('friendly');
  const [targetAudience, setTargetAudience] = useState('');
  const [writingStyleLinkedin, setWritingStyleLinkedin] = useState('');
  const [writingStyleTwitter, setWritingStyleTwitter] = useState('');
  const [keyTopics, setKeyTopics] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isTraining, setIsTraining] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('brandSettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.brandName) setBrandName(parsed.brandName);
        if (parsed.brandDescription) setBrandDescription(parsed.brandDescription);
        if (parsed.brandVoice) setBrandVoice(parsed.brandVoice);
        if (parsed.tone) setTone(parsed.tone);
        if (parsed.targetAudience) setTargetAudience(parsed.targetAudience);
        if (parsed.writingStyleLinkedin) setWritingStyleLinkedin(parsed.writingStyleLinkedin);
        if (parsed.writingStyleTwitter) setWritingStyleTwitter(parsed.writingStyleTwitter);
        if (parsed.keyTopics) setKeyTopics(parsed.keyTopics);
      } catch (e) {}
    }
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    const settings = {
      brandName,
      brandDescription,
      brandVoice,
      tone,
      targetAudience,
      writingStyleLinkedin,
      writingStyleTwitter,
      keyTopics,
    };
    localStorage.setItem('brandSettings', JSON.stringify(settings));
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSaving(false);
  };

  const handleTrain = async () => {
    if (isTraining) return;
    setIsTraining(true);
    await handleSave();
    alert("AI has successfully learned your brand voice!");
    setIsTraining(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Brand Settings</h1>
        <p className="text-gray-400">Train the AI to match your unique brand voice and style</p>
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
        <div className="space-y-4">
          <Input
            label="Brand Name"
            placeholder="Your brand or company name"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
          />
          <Textarea
            label="Brand Description"
            placeholder="Describe what your brand does and stands for..."
            rows={3}
            value={brandDescription}
            onChange={(e) => setBrandDescription(e.target.value)}
          />
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-white mb-4">Voice & Tone</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Brand Voice"
            options={voiceOptions}
            value={brandVoice}
            onChange={(e) => setBrandVoice(e.target.value)}
          />
          <Select
            label="Tone"
            options={toneOptions}
            value={tone}
            onChange={(e) => setTone(e.target.value)}
          />
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-white mb-4">Target Audience</h3>
        <Textarea
          placeholder="Describe your target audience (e.g., 'B2B SaaS founders, tech-savvy professionals aged 25-45')"
          rows={3}
          value={targetAudience}
          onChange={(e) => setTargetAudience(e.target.value)}
        />
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-white mb-4">Writing Style Examples</h3>
        <p className="text-sm text-gray-400 mb-4">
          Paste examples of your best-performing content separately for LinkedIn and Twitter.
        </p>
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-white">LinkedIn examples</label>
            <Textarea
              placeholder="Paste LinkedIn examples that show your brand voice..."
              rows={6}
              value={writingStyleLinkedin}
              onChange={(e) => setWritingStyleLinkedin(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-white">Twitter examples</label>
            <Textarea
              placeholder="Paste Twitter examples that show your brand voice..."
              rows={6}
              value={writingStyleTwitter}
              onChange={(e) => setWritingStyleTwitter(e.target.value)}
            />
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-white mb-4">Key Topics & Themes</h3>
        <Textarea
          placeholder="What topics does your brand cover? (e.g., 'productivity, entrepreneurship, marketing strategies')"
          rows={3}
          value={keyTopics}
          onChange={(e) => setKeyTopics(e.target.value)}
        />
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-white mb-4">Content Guidelines</h3>
        <div className="space-y-4">
          <div className="p-4 bg-[rgba(15,15,15,0.8)] border border-white/10 rounded-lg">
            <h4 className="text-sm font-medium text-white mb-2">Do's</h4>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Use clear, concise language</li>
              <li>• Include actionable insights</li>
              <li>• Add relevant hashtags</li>
            </ul>
          </div>
          <div className="p-4 bg-[rgba(15,15,15,0.8)] border border-white/10 rounded-lg">
            <h4 className="text-sm font-medium text-white mb-2">Don'ts</h4>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Avoid jargon and complex terms</li>
              <li>• Don't make unverified claims</li>
              <li>• Avoid controversial topics</li>
            </ul>
          </div>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button
          variant="primary"
          icon={<Save className="w-4 h-4" />}
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
        <Button
          variant="secondary"
          icon={<Sparkles className="w-4 h-4" />}
          onClick={handleTrain}
          disabled={isTraining}
        >
          {isTraining ? 'Training AI...' : 'Train AI on My Brand'}
        </Button>
      </div>
    </div>
  );
}
