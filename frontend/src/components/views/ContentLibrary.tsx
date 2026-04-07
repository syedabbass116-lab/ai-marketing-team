import { useState } from "react";
import { Copy, Trash2 } from "lucide-react";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Input from "../ui/Input";

type ContentItem = {
  platform: string;
  text: string;
};

type Props = {
  library: ContentItem[];
};

export default function ContentLibrary({ library }: Props) {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = library.filter((item) =>
    item.text.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl text-white">Content Library</h1>

      <Input
        placeholder="Search..."
        value={searchQuery}
        onChange={(e: any) => setSearchQuery(e.target.value)}
      />

      {filtered.map((item, i) => (
        <Card key={i}>
          <p>{item.text}</p>

          <div className="flex gap-2">
            <Button onClick={() => navigator.clipboard.writeText(item.text)}>
              <Copy size={14} />
            </Button>
            <Button>
              <Trash2 size={14} />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
