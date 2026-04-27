import MemberProfileComponent from "../../../components/MemberProfileComponent/MemberProfileComponent";

export async function generateMetadata({ params }) {
  const { username } = await params;
  const decodedName = decodeURIComponent(username);

  return {
    title: `${decodedName} — Clock Crew Member`,
    description: `Profile page for ${decodedName}, a member of the Clock Crew — the legendary Newgrounds Flash animation collective.`,
    openGraph: {
      title: `${decodedName} — Clock Crew Member`,
      description: `View ${decodedName}'s Clock Crew profile, forum activity, and Newgrounds submissions.`,
    },
  };
}

export default async function MemberProfilePage({ params }) {
  const { username } = await params;
  const decodedName = decodeURIComponent(username);

  return <MemberProfileComponent username={decodedName} />;
}
