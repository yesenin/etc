'use client';

import { useState } from "react";
import shuffle from "lodash-es/shuffle";

const columns = {
    left: [
        "izdavanje",
        "stan",
        "",
        "A4"
    ],
    right: [
        "B1",
        "B2",
        "B3",
        "B4"
    ]
}

export default function GamePage(): React.ReactElement {
    const [leftSelected, setLeftSelected] = useState<string | null>(null);
    const [rightSelected, setRightSelected] = useState<string | null>(null);
  return (
    <div className="flex flex-row gap-4 bg-white p-4 text-black">
      <div className="flex flex-col gap-4 bg-white p-4 text-black">
        {shuffle(columns.left).map((item) => (
          <div key={item} onClick={() => setLeftSelected(item)}>{item}</div>
        ))}
      </div>
        <div className="flex flex-col gap-4 bg-white p-4 text-black">
            {shuffle(columns.right).map((item) => (
              <div key={item} onClick={() => setRightSelected(item)}>{item}</div>
            ))}
        </div>
    </div>
  )
}