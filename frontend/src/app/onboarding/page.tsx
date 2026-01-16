'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/lib/auth';
import { referenceApi, profileApi } from '@/lib/api';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Textarea from '@/components/Textarea';
import type { IndustryCategory, Objective, Stage } from '@/types';
import clsx from 'clsx';

interface FounderForm {
  startup_name: string;
  category: string;
  industry: number;
  stage: string;
  about_startup: string;
}

interface MentorForm {
  company: string;
  role: string;
  years_of_experience: number;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [industries, setIndustries] = useState<IndustryCategory[]>([]);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [selectedObjectives, setSelectedObjectives] = useState<number[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<number[]>([]);

  const founderForm = useForm<FounderForm>();
  const mentorForm = useForm<MentorForm>();

  const selectedCategory = founderForm.watch('category');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [industriesData, objectivesData, stagesData] = await Promise.all([
          referenceApi.getIndustries(),
          referenceApi.getObjectives(),
          referenceApi.getStages(),
        ]);
        setIndustries(industriesData);
        setObjectives(objectivesData);
        setStages(stagesData);
      } catch {
        setError('Failed to load data');
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (user?.has_profile) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const subcategories = industries.find((c) => c.slug === selectedCategory)?.subcategories || [];

  const toggleObjective = (id: number) => {
    setSelectedObjectives((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
    );
  };

  const toggleIndustry = (id: number) => {
    setSelectedIndustries((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleFounderSubmit = async (data: FounderForm) => {
    if (step === 1) {
      setStep(2);
      return;
    }
    if (step === 2) {
      if (selectedObjectives.length === 0) {
        setError('Please select at least one objective');
        return;
      }
      setStep(3);
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await profileApi.createFounderProfile({
        startup_name: data.startup_name,
        industry: data.industry,
        stage: data.stage,
        objectives: selectedObjectives,
        about_startup: data.about_startup,
      });
      await refreshUser();
      router.push('/dashboard');
    } catch {
      setError('Failed to create profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMentorSubmit = async (data: MentorForm) => {
    if (step === 1) {
      setStep(2);
      return;
    }
    if (step === 2) {
      if (selectedIndustries.length === 0 || selectedObjectives.length === 0) {
        setError('Please select at least one industry and one area you can help with');
        return;
      }
      setStep(3);
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await profileApi.createMentorProfile({
        company: data.company,
        role: data.role,
        years_of_experience: data.years_of_experience,
        expertise_industries: selectedIndustries,
        can_help_with: selectedObjectives,
      });
      await refreshUser();
      if (user?.is_approved) {
        router.push('/dashboard');
      } else {
        router.push('/pending');
      }
    } catch {
      setError('Failed to create profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  const totalSteps = 3;
  const stepLabels =
    user.user_type === 'founder'
      ? ['Startup', 'Objectives', 'Bio']
      : ['Experience', 'Expertise', 'Bio'];

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-sm text-gray-500 mb-2">Step {step} of {totalSteps}</p>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Complete Your {user.user_type === 'founder' ? 'Founder' : 'Mentor'} Profile
          </h1>

          <div className="flex items-center justify-center gap-2 mb-8">
            {stepLabels.map((label, index) => (
              <div key={label} className="flex items-center">
                <div
                  className={clsx(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                    index + 1 < step
                      ? 'bg-primary-600 text-white'
                      : index + 1 === step
                      ? 'bg-primary-100 text-primary-700 border-2 border-primary-600'
                      : 'bg-gray-100 text-gray-500'
                  )}
                >
                  {index + 1 < step ? '✓' : index + 1}
                </div>
                <span className="ml-2 text-sm text-gray-600">{label}</span>
                {index < stepLabels.length - 1 && (
                  <div className="w-12 h-0.5 bg-gray-200 mx-2" />
                )}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {user.user_type === 'founder' ? (
            <form onSubmit={founderForm.handleSubmit(handleFounderSubmit)} className="space-y-6">
              {step === 1 && (
                <>
                  <Input
                    label="Startup Name"
                    {...founderForm.register('startup_name', { required: 'Startup name is required' })}
                    error={founderForm.formState.errors.startup_name?.message}
                  />

                  <Select
                    label="Industry Category"
                    options={industries.map((c) => ({ value: c.slug, label: c.name }))}
                    placeholder="Select category..."
                    {...founderForm.register('category', { required: 'Category is required' })}
                    error={founderForm.formState.errors.category?.message}
                  />

                  {subcategories.length > 0 && (
                    <Select
                      label="Subcategory"
                      options={subcategories.map((s) => ({ value: s.id, label: s.name }))}
                      placeholder="Select subcategory..."
                      {...founderForm.register('industry', { required: 'Subcategory is required' })}
                      error={founderForm.formState.errors.industry?.message}
                    />
                  )}

                  <Select
                    label="Stage"
                    options={stages.map((s) => ({ value: s.value, label: s.label }))}
                    placeholder="Select stage..."
                    {...founderForm.register('stage', { required: 'Stage is required' })}
                    error={founderForm.formState.errors.stage?.message}
                  />

                  <Textarea
                    label="About Your Startup"
                    rows={4}
                    {...founderForm.register('about_startup', { required: 'About is required' })}
                    error={founderForm.formState.errors.about_startup?.message}
                  />
                </>
              )}

              {step === 2 && (
                <>
                  <p className="text-sm text-gray-600 mb-4">What do you need help with?</p>
                  <div className="grid grid-cols-2 gap-3">
                    {objectives.map((obj) => (
                      <button
                        key={obj.id}
                        type="button"
                        onClick={() => toggleObjective(obj.id)}
                        className={clsx(
                          'p-3 rounded-lg border-2 text-left text-sm transition-colors',
                          selectedObjectives.includes(obj.id)
                            ? 'border-primary-600 bg-primary-50 text-primary-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        )}
                      >
                        {obj.name}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {step === 3 && (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">Profile ready to be created!</p>
                </div>
              )}

              <div className="flex justify-between pt-4">
                {step > 1 && (
                  <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                    Back
                  </Button>
                )}
                <Button type="submit" className={step === 1 ? 'w-full' : 'ml-auto'} isLoading={isLoading}>
                  {step === totalSteps ? 'Complete Profile' : 'Continue'}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={mentorForm.handleSubmit(handleMentorSubmit)} className="space-y-6">
              {step === 1 && (
                <>
                  <Input
                    label="Company"
                    {...mentorForm.register('company', { required: 'Company is required' })}
                    error={mentorForm.formState.errors.company?.message}
                  />

                  <Input
                    label="Role / Title"
                    {...mentorForm.register('role', { required: 'Role is required' })}
                    error={mentorForm.formState.errors.role?.message}
                  />

                  <Input
                    label="Years of Experience"
                    type="number"
                    {...mentorForm.register('years_of_experience', {
                      required: 'Years of experience is required',
                      min: { value: 1, message: 'Must be at least 1 year' },
                    })}
                    error={mentorForm.formState.errors.years_of_experience?.message}
                  />
                </>
              )}

              {step === 2 && (
                <>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">Expertise Industries</p>
                    <div className="grid grid-cols-2 gap-2">
                      {industries.flatMap((cat) =>
                        cat.subcategories.map((sub) => (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => toggleIndustry(sub.id)}
                            className={clsx(
                              'p-2 rounded-lg border text-left text-sm transition-colors',
                              selectedIndustries.includes(sub.id)
                                ? 'border-primary-600 bg-primary-50 text-primary-700'
                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                            )}
                          >
                            {sub.name}
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">I Can Help With</p>
                    <div className="grid grid-cols-2 gap-2">
                      {objectives.map((obj) => (
                        <button
                          key={obj.id}
                          type="button"
                          onClick={() => toggleObjective(obj.id)}
                          className={clsx(
                            'p-2 rounded-lg border text-left text-sm transition-colors',
                            selectedObjectives.includes(obj.id)
                              ? 'border-primary-600 bg-primary-50 text-primary-700'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          )}
                        >
                          {obj.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {step === 3 && (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">
                    Your mentor application will be reviewed by our team.
                  </p>
                </div>
              )}

              <div className="flex justify-between pt-4">
                {step > 1 && (
                  <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                    Back
                  </Button>
                )}
                <Button type="submit" className={step === 1 ? 'w-full' : 'ml-auto'} isLoading={isLoading}>
                  {step === totalSteps ? 'Submit Application' : 'Continue'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
