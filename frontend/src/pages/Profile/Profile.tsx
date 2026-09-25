import React, { useState, useRef } from 'react';
import { 
  Award, 
  BookOpen, 
  Mail, 
  Building, 
  GraduationCap, 
  Camera, 
  Edit3, 
  Check, 
  Copy, 
  Sparkles, 
  CheckCircle2, 
  Plus, 
  X,
  Shield
} from 'lucide-react';
import { mockUser } from '../../data/mockData';
import type { UserProfile } from '../../types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';

export const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>(mockUser);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Edit form state
  const [formData, setFormData] = useState<UserProfile>(mockUser);
  const [newTag, setNewTag] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  function copyId() {
    navigator.clipboard.writeText(profile.researchFlowId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const updated = { ...profile, avatarUrl: event.target.result as string };
          setProfile(updated);
          setFormData(updated);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setProfile(formData);
    setIsEditOpen(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  }

  function handleAddInterest() {
    if (newTag.trim() && !formData.researchInterests.includes(newTag.trim())) {
      setFormData({
        ...formData,
        researchInterests: [...formData.researchInterests, newTag.trim()]
      });
      setNewTag('');
    }
  }

  function handleRemoveInterest(tagToRemove: string) {
    setFormData({
      ...formData,
      researchInterests: formData.researchInterests.filter(t => t !== tagToRemove)
    });
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Toast Notification */}
      {saveSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Profile changes saved successfully! Ready for backend sync.</span>
        </div>
      )}

      {/* Student Banner */}
      <Card className="relative overflow-hidden p-6 md:p-8 bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/40">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar with Camera Trigger */}
          <div className="relative group shrink-0">
            <img 
              src={profile.avatarUrl} 
              alt={profile.fullName} 
              className="w-28 h-28 rounded-2xl object-cover border-2 border-blue-500/50 shadow-2xl transition duration-200 group-hover:brightness-75"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition rounded-2xl bg-black/60 text-white cursor-pointer text-xs gap-1"
              title="Upload / Change Profile Picture"
            >
              <Camera className="w-5 h-5 text-blue-400" />
              <span className="text-[10px]">Change Photo</span>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />
          </div>

          {/* Identity Info */}
          <div className="space-y-3 text-center md:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h1 className="text-2xl font-bold text-white">{profile.fullName}</h1>
              <Badge variant="emerald">Verified Researcher</Badge>
            </div>

            <p className="text-xs text-slate-300 flex items-center justify-center md:justify-start gap-2">
              <GraduationCap className="w-4 h-4 text-blue-400" /> {profile.degree} • {profile.institution}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {profile.email}</span>
              <span className="flex items-center gap-1"><Building className="w-3.5 h-3.5" /> Advisor: {profile.advisor}</span>
            </div>

            {profile.bio && (
              <p className="text-xs text-slate-300/90 leading-relaxed max-w-2xl pt-1">
                {profile.bio}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 shrink-0">
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => {
                setFormData(profile);
                setIsEditOpen(true);
              }}
              icon={<Edit3 className="w-3.5 h-3.5" />}
            >
              Edit Profile
            </Button>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              icon={<Camera className="w-3.5 h-3.5" />}
            >
              Change Photo
            </Button>
          </div>
        </div>
      </Card>

      {/* ResearchFlow ID Card */}
      <Card className="flex flex-col sm:flex-row items-center justify-between p-5 bg-blue-950/20 border-blue-500/30 gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> ResearchFlow ID Credential
            </div>
            <div className="text-lg font-mono font-bold text-white tracking-wider mt-0.5">
              {profile.researchFlowId}
            </div>
            <div className="text-[11px] text-slate-400">
              Unique institutional token for autonomous agent dispatch and peer review provenance.
            </div>
          </div>
        </div>

        <button
          onClick={copyId}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-mono transition cursor-pointer border border-slate-700 shrink-0"
        >
          {copiedId ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          {copiedId ? 'Copied ID' : 'Copy ID'}
        </button>
      </Card>

      {/* Academic Details & Research Interests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="font-semibold text-white text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" /> Academic Standing & Metrics
            </h4>
            <span className="text-[11px] font-mono text-slate-400">Semester 7 / Graduate</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Cumulative GPA:</span>
              <span className="text-emerald-400 font-mono font-bold text-sm">{profile.gpa}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Department / Lab:</span>
              <span className="text-white text-right">{profile.department}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Current Semester:</span>
              <span className="text-white">{profile.currentSemester}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Thesis Advisor:</span>
              <span className="text-white">{profile.advisor}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Active Project:</span>
              <span className="text-blue-400 text-right truncate max-w-[200px]">{profile.activeProjectName}</span>
            </div>
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="font-semibold text-white text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-400" /> Research Interests & Tags
            </h4>
            <span className="text-[11px] text-slate-400">{profile.researchInterests.length} topics</span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {profile.researchInterests.map((interest, i) => (
              <Badge key={i} variant="purple" size="md">
                {interest}
              </Badge>
            ))}
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-[11px] text-slate-400">
            Agents use these semantic topics to personalize literature retrieval across arXiv, OpenAlex, and Semantic Scholar.
          </div>
        </Card>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Student Researcher Profile"
        maxWidth="2xl"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Full Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Academic Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Degree & Major</label>
              <input
                type="text"
                value={formData.degree}
                onChange={e => setFormData({ ...formData, degree: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Institution / University</label>
              <input
                type="text"
                value={formData.institution}
                onChange={e => setFormData({ ...formData, institution: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Current Semester</label>
              <input
                type="text"
                value={formData.currentSemester}
                onChange={e => setFormData({ ...formData, currentSemester: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Cumulative GPA</label>
              <input
                type="text"
                value={formData.gpa}
                onChange={e => setFormData({ ...formData, gpa: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Thesis Advisor</label>
              <input
                type="text"
                value={formData.advisor}
                onChange={e => setFormData({ ...formData, advisor: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-medium">Department / Research Lab</label>
            <input
              type="text"
              value={formData.department}
              onChange={e => setFormData({ ...formData, department: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-medium">Research Interests & Keywords</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                placeholder="e.g. Graph Neural Networks"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddInterest();
                  }
                }}
              />
              <Button type="button" size="sm" variant="secondary" onClick={handleAddInterest} icon={<Plus className="w-3.5 h-3.5" />}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5 p-2 bg-slate-950 rounded-lg border border-slate-800 max-h-24 overflow-y-auto">
              {formData.researchInterests.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 text-[11px] bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded-full">
                  {tag}
                  <button type="button" onClick={() => handleRemoveInterest(tag)} className="hover:text-white cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-medium">Bio & Scientific Focus</label>
            <textarea
              value={formData.bio || ''}
              onChange={e => setFormData({ ...formData, bio: e.target.value })}
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" icon={<Check className="w-3.5 h-3.5" />}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
