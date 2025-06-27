
import { useState } from 'react';

interface CVData {
  title: string;
  template_id: string;
  content: {
    personalInfo: any;
    education: any[];
    experience: any[];
    skills: any[];
    [key: string]: any;
  };
}

interface CV extends CVData {
  id: number;
  created_at: string;
  updated_at: string;
}

export function useCV() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCV = async (cvData: CVData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/CV_Generator/api/cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cvData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsLoading(false);
        return { success: true, cv_id: data.cv_id };
      } else {
        setError(data.error || 'Failed to create CV');
        setIsLoading(false);
        return { success: false, error: data.error };
      }
    } catch (error) {
      setError('Error creating CV');
      setIsLoading(false);
      return { success: false, error: 'CV creation request failed' };
    }
  };

  const getCV = async (cvId: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/CV_Generator/api/cv/${cvId}`);
      const data = await response.json();
      
      if (data.success) {
        setIsLoading(false);
        return { success: true, cv: data.cv };
      } else {
        setError(data.error || 'Failed to fetch CV');
        setIsLoading(false);
        return { success: false, error: data.error };
      }
    } catch (error) {
      setError('Error fetching CV');
      setIsLoading(false);
      return { success: false, error: 'CV fetch request failed' };
    }
  };

  const updateCV = async (cvId: number, cvData: Partial<CVData>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/CV_Generator/api/cv/${cvId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cvData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsLoading(false);
        return { success: true };
      } else {
        setError(data.error || 'Failed to update CV');
        setIsLoading(false);
        return { success: false, error: data.error };
      }
    } catch (error) {
      setError('Error updating CV');
      setIsLoading(false);
      return { success: false, error: 'CV update request failed' };
    }
  };

  const deleteCV = async (cvId: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/CV_Generator/api/cv/${cvId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsLoading(false);
        return { success: true };
      } else {
        setError(data.error || 'Failed to delete CV');
        setIsLoading(false);
        return { success: false, error: data.error };
      }
    } catch (error) {
      setError('Error deleting CV');
      setIsLoading(false);
      return { success: false, error: 'CV deletion request failed' };
    }
  };

  const getUserCVs = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/CV_Generator/api/cv');
      const data = await response.json();
      
      if (data.success) {
        setIsLoading(false);
        return { success: true, cvs: data.cvs };
      } else {
        setError(data.error || 'Failed to fetch CVs');
        setIsLoading(false);
        return { success: false, error: data.error };
      }
    } catch (error) {
      setError('Error fetching CVs');
      setIsLoading(false);
      return { success: false, error: 'CV fetch request failed' };
    }
  };

  return {
    isLoading,
    error,
    createCV,
    getCV,
    updateCV,
    deleteCV,
    getUserCVs
  };
}