import { redirect } from 'next/navigation';

/** X Intel is integrated into the main dashboard — redirect legacy /v2 URL */
export default function V2Redirect() {
  redirect('/#x-intel');
}