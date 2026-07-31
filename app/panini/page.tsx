import { need, swap, test } from "./data";
import { StickerSet } from "./types";


export default function Panini(): React.ReactElement {
  return (
    <div className="flex flex-col gap-4 bg-white p-4 text-black">
      <div>
        <span className="text-2xl font-serif">01.08.2026 00:55 AM</span>
      </div>
      <div className="flex flex-row gap-4">
       <table className="table-auto border-collapse border border-gray-300 font-mono text-sm">
          <tbody>
            {swap.map((sticker: StickerSet) => (
              <tr key={sticker.code}>
                <td className="border border-gray-300 text-green-500 font-bold">
                  {sticker.code}
                </td>
                <td className="border border-gray-300">
                  {Array.from(
                    { length: 20 },
                    (_, index) =>
                      sticker.have[index + 1] != null && sticker.have[index + 1] > 0 && (
                        <span key={index} className="inline-block px-1">
                          {index + 1}
                          {sticker.have[index + 1]! > 1 && (
                            <sup>{sticker.have[index + 1]}</sup>
                          )}&nbsp;
                        </span>
                      ),
                  )}
                </td>
                <td className="border border-gray-300">
                  {Object.values(sticker.have).reduce(
                    (total, count) => (total ?? 0) + (count ?? 0),
                    0,
                  )}
                </td>
              </tr>
            ))}
            <tr>
              <td></td>
              <td className="border border-gray-300 text-violet-500 font-bold text-right">
                Total
              </td>
              <td className="border border-gray-300">
                {swap.reduce(
                  (total, sticker) =>
                    total +
                    Object.values(sticker.have).reduce(
                      (stickerTotal, count) => (stickerTotal ?? 0) + (count ?? 0),
                      0,
                    ),
                  0,
                )}
              </td>
            </tr>
          </tbody>
        </table>
        <table className="table-auto border-collapse border border-gray-300 font-mono text-sm">
          <tbody>
            {need.map((sticker: StickerSet) => (
              <tr key={sticker.code}>
                <td className="border border-gray-300 text-red-500 font-bold">
                  {sticker.code}
                </td>
                <td className="border border-gray-300">
                  {Array.from(
                    { length: 20 },
                    (_, index) =>
                      sticker.have[index + 1] != null && sticker.have[index + 1] > 0 && (
                        <span key={index} className="inline-block px-1">
                          {index + 1}&nbsp;
                        </span>
                      ),
                  )}
                </td>
                <td className="border border-gray-300">
                  {Object.values(sticker.have).reduce(
                    (total, count) => (total ?? 0) + (count ?? 0),
                    0,
                  )}
                </td>
              </tr>
            ))}
            <tr>
              <td></td>
              <td className="border border-gray-300 text-violet-500 font-bold text-right">
                Total
              </td>
              <td className="border border-gray-300">
                {need.reduce(
                  (total, sticker) =>
                    total +
                    Object.values(sticker.have).reduce(
                      (stickerTotal, count) => (stickerTotal ?? 0) + (count ?? 0),
                      0,
                    ),
                  0,
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
