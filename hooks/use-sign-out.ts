'use client';
import { useRouter } from 'next/navigation';
import { useAccount } from '@/contexts/AccountContext';
import { useLocale } from '@/contexts/LocaleContext';
import { useFormState, initialUserData } from '@/contexts/FormStateContext';
import { useGeneration } from '@/contexts/GenerationContext';
import { getAuthClient } from '@/services/authClient';
import { localizedPath } from '@/services/routing';

export function useSignOut() {
  const router = useRouter();
  const { refresh } = useAccount();
  const { locale } = useLocale();
  const { setUserData, setJobDetails, setCurrentStep } = useFormState();
  const output = useGeneration();
  return async () => {
    const client = await getAuthClient();
    if (!client) throw new Error('Unable to sign out. Please try again.');
    // The auth proxy expects JSON even though sign-out has no input fields.
    const result = await client.signOut({ fetchOptions: { body: {} } });
    if (result?.error) throw new Error('Unable to sign out. Please try again.');
    setUserData({ ...initialUserData });
    setJobDetails({ url: '', screenshot: null });
    setCurrentStep(1);
    output.setCoverLetter('');
    output.setDrafts({});
    output.setHistoryRevision(value => value + 1);
    output.setAdmissionInfo(null);
    output.setFoundCourses([]);
    output.setAnalysisNotes('');
    output.setExtractedKeywords([]);
    output.setError(null);
    output.setAnalysisError(null);
    output.setKeywordError(null);
    await refresh();
    router.replace(localizedPath(locale, '/'));
    router.refresh();
  };
}
