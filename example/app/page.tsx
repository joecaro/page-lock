import { BrowserWindow } from "./components/browser-window";
import { ConsoleWindow } from "./components/console-window";

// Sample users
const users = [
  {
    id: "1",
    email: "alice@example.com",
    name: "Alice",
  },
  {
    id: "2",
    email: "bob@example.com",
    name: "Bob",
  },
];

// Sample records
const records = [
  {
    id: "1",
    title: "Important Document",
    content:
      "This is a very important document that needs careful coordination when editing. It contains sensitive information that should be managed carefully to avoid conflicts.",
  },
  {
    id: "2",
    title: "Project Roadmap",
    content:
      "Our project roadmap details the upcoming features and milestones. The next quarter focuses on improving user experience and adding real-time collaboration features.",
  },
  {
    id: "3",
    title: "Meeting Notes",
    content:
      "Notes from our last team meeting discussing the new features. We covered the implementation timeline, resource allocation, and potential challenges we need to address.",
  },
];

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-10xl mx-auto">
        <h1 className="text-2xl font-bold mb-8 text-center">Locksmith Demo</h1>

        <div className="grid grid-cols-2 gap-8">
          {users.map((user) => (
            <BrowserWindow key={user.id} user={user} records={records} />
          ))}
          <ConsoleWindow />
        </div>
      </div>
    </div>
  );
}
