import { Redirect } from 'expo-router';


// Just a dummy index that redirects; the _layout.js actually handles the real auth guarding,
// but we need an index file so Expo Router doesn't crash on '/'
export default function Index() {
  return null;
}
