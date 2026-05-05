import { useState, useEffect } from "react";
import { Save, Sparkles, Loader2, Check } from "lucide-react";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";
import Select from "../ui/Select";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

const voiceOptions = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "bold", label: "Bold" },
  { value: "inspirational", label: "Inspirational" },
  { value: "humorous", label: "Humorous" },
];

const toneOptions = [
  { value: "friendly", label: "Friendly" },
  { value: "authoritative", label: "Authoritative" },
  { value: "empathetic", label: "Empathetic" },
  { value: "educational", label: "Educational" },
];

export default function BrandSettings() {
  const { user } = useAuth();
  const [brandName, setBrandName] = useState("");
  const [brandDescription, setBrandDescription] = useState("");
  const [brandVoice, setBrandVoice] = useState("professional");
  const [tone, setTone] = useState("friendly");
  const [targetAudience, setTargetAudience] = useState("");
  const [writingStyleLinkedin, setWritingStyleLinkedin] = useState("");
  const [writingStyleTwitter, setWritingStyleTwitter] = useState("");
  const [writingStyleThreads, setWritingStyleThreads] = useState("");
  const [keyTopics, setKeyTopics] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('brand_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (data) {
          setBrandName(data.brand_name || "");
          setBrandDescription(data.brand_description || "");
          setBrandVoice(data.brand_voice || "professional");
          setTone(data.tone || "friendly");
          setTargetAudience(data.target_audience || "");
          setWritingStyleLinkedin(data.writing_style_linkedin || "");
          setWritingStyleTwitter(data.writing_style_twitter || "");
          setWritingStyleThreads(data.writing_style_threads || "");
          setKeyTopics(data.key_topics || "");
          
          // Also sync to localStorage for the chat component to use immediately
          localStorage.setItem("brandSettings", JSON.stringify({
            brandName: data.brand_name,
            brandDescription: data.brand_description,
            brandVoice: data.brand_voice,
            tone: data.tone,
            targetAudience: data.target_audience,
            writingStyleLinkedin: data.writing_style_linkedin,
            writingStyleTwitter: data.writing_style_twitter,
            writingStyleThreads: data.writing_style_threads,
            keyTopics: data.key_topics
          }));
        }
      } catch (err) {
        console.error("Error loading brand settings:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    setSaveSuccess(false);

    const settings = {
      user_id: user.id,
      brand_name: brandName,
      brand_description: brandDescription,
      brand_voice: brandVoice,
      tone: tone,
      target_audience: targetAudience,
      writing_style_linkedin: writingStyleLinkedin,
      writing_style_twitter: writingStyleTwitter,
      writing_style_threads: writingStyleThreads,
      key_topics: keyTopics,
      updated_at: new Date().toISOString(),
    };

    try {
      const { error } = await supabase
        .from('brand_settings')
        .upsert(settings);

      if (error) throw error;

      // Update localStorage so chat works immediately without reload
      localStorage.setItem("brandSettings", JSON.stringify({
        brandName,
        brandDescription,
        brandVoice,
        tone,
        targetAudience,
        writingStyleLinkedin,
        writingStyleTwitter,
        writingStyleThreads,
        keyTopics
      }));

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving brand settings:", err);
      alert("Failed to save settings. Make sure you have a 'brand_settings' table in Supabase.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTrain = async () => {
    if (isTraining || !user) return;
    setIsTraining(true);
    await handleSave();
    setIsTraining(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-white/20" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Brand Settings</h1>
        <p className="text-gray-400">
          Train the AI to match your unique brand voice and style
        </p>
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-white mb-4">
          Basic Information
        </h3>
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
        <h3 className="text-lg font-semibold text-white mb-4">
          Target Audience
        </h3>
        <Textarea
          placeholder="Describe your target audience (e.g., 'B2B SaaS founders, tech-savvy professionals aged 25-45')"
          rows={3}
          value={targetAudience}
          onChange={(e) => setTargetAudience(e.target.value)}
        />
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-white mb-4">
          Writing Style Examples
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          Paste examples of your best-performing content separately for LinkedIn,
          Twitter, and Threads.
        </p>
        <div className="grid gap-4 lg:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              LinkedIn examples
            </label>
            <Textarea
              placeholder="Paste LinkedIn examples that show your brand voice..."
              rows={6}
              value={writingStyleLinkedin}
              onChange={(e) => setWritingStyleLinkedin(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Twitter examples
            </label>
            <Textarea
              placeholder="Paste Twitter examples that show your brand voice..."
              rows={6}
              value={writingStyleTwitter}
              onChange={(e) => setWritingStyleTwitter(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Threads examples
            </label>
            <Textarea
              placeholder="Paste Threads examples that show your brand voice..."
              rows={6}
              value={writingStyleThreads}
              onChange={(e) => setWritingStyleThreads(e.target.value)}
            />
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-white mb-4">
          Key Topics & Themes
        </h3>
        <Textarea
          placeholder="What topics does your brand cover? (e.g., 'productivity, entrepreneurship, marketing strategies')"
          rows={3}
          value={keyTopics}
          onChange={(e) => setKeyTopics(e.target.value)}
        />
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-white mb-4">
          Content Guidelines
        </h3>
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
          onClick={handleSave}
          disabled={isSaving}
          className={saveSuccess ? "!bg-green-600 border-green-600 text-white" : ""}
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : saveSuccess ? (
            <Check className="w-4 h-4 mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {isSaving ? "Saving..." : saveSuccess ? "Saved Successfully" : "Save Settings"}
        </Button>
        <Button
          variant="secondary"
          onClick={handleTrain}
          disabled={isTraining}
        >
          {isTraining ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Sparkles className="w-4 h-4 mr-2" />
          )}
          {isTraining ? "Training AI..." : "Train AI on My Brand"}
        </Button>
      </div>
    </div>
  );
}
