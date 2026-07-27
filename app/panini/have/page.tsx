import { swap } from "../data"
import { StickerSet } from "../types"

export default function PaniniHavePage(): React.ReactElement {
    return (
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
                        sticker.have[index + 1] && (
                        <span key={index} className="inline-block px-1">
                            {index + 1}&nbsp;
                        </span>
                        ),
                    )}
                </td>
                </tr>
            ))}
            </tbody>
        </table>
    )
}