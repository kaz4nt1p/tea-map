'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { Activity, CreateActivityRequest } from '../../../../lib/types';
import { Spot } from '../../../../lib/spots';
import { ActivityForm } from '../../../../components/ActivityForm';
import { activitiesApi } from '../../../../lib/api';
import { toast } from 'react-hot-toast';

export default function EditActivityPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activityId = params.id as string;

  useEffect(() => {
    if (activityId && user) {
      fetchActivity();
    }
  }, [activityId, user]);

  const fetchActivity = async () => {
    setIsLoading(true);
    try {
      console.log('Current user from auth:', user);
      
      const { activity } = await activitiesApi.getActivityById(activityId);
      console.log('Activity data received:', activity);
      
      // Check if user owns this activity
      const isOwner = user?.id === activity.user_id;
      console.log('Ownership check:', {
        userId: user?.id,
        activityUserId: activity.user_id,
        isOwner
      });
      
      if (!isOwner) {
        toast.error('You can only edit your own activities');
        router.push(`/activities/${activityId}`);
        return;
      }
      
      setActivity(activity);
    } catch (error) {
      console.error('Error fetching activity:', error);
      toast.error('Failed to load activity');
      router.push('/activities');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (formData: CreateActivityRequest) => {
    setIsSubmitting(true);
    try {
      console.log('Submitting form data:', formData);
      console.log('duration_minutes type:', typeof formData.duration_minutes, 'value:', formData.duration_minutes);
      
      await activitiesApi.updateActivity(activityId, formData);

      toast.success('Activity updated successfully!');
      router.push(`/activities/${activityId}`);
    } catch (error) {
      console.error('Error updating activity:', error);
      toast.error('Failed to update activity');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/activities/${activityId}`);
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading activity...</p>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Activity not found</p>
        </div>
      </div>
    );
  }

  // Convert Activity to CreateActivityRequest format and prepare initial spot
  const initialData: CreateActivityRequest = {
    title: activity.title,
    description: activity.description || '',
    tea_type: activity.tea_type || '',
    tea_name: activity.tea_name || '',
    tea_details: activity.tea_details ? {
      ...activity.tea_details,
      brewing_temperature: activity.tea_details.brewing_temperature ? Number(activity.tea_details.brewing_temperature) : undefined,
      steeping_time: activity.tea_details.steeping_time ? Number(activity.tea_details.steeping_time) : undefined,
    } : {},
    mood_before: activity.mood_before || '',
    mood_after: activity.mood_after || '',
    taste_notes: activity.taste_notes || '',
    insights: activity.insights || '',
    duration_minutes: activity.duration_minutes ? Number(activity.duration_minutes) : undefined,
    weather_conditions: activity.weather_conditions || '',
    companions: activity.companions || [],
    photos: activity.media?.map(m => m.file_path) || [],
    privacy_level: activity.privacy_level,
    spot_id: activity.spot_id
  };

  // Convert Spot to LegacySpot format for compatibility
  const initialSpot: Spot | null = activity.spot ? {
    id: activity.spot.id,
    name: activity.spot.name,
    description: activity.spot.description || '',
    longDescription: activity.spot.long_description || '',
    image: activity.spot.image_url || '',
    lat: activity.spot.latitude,
    lng: activity.spot.longitude,
    created_at: activity.spot.created_at
  } : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <ActivityForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        initialSpot={initialSpot}
        isLoading={isSubmitting}
        initialData={initialData}
        mode="edit"
      />
    </div>
  );
}