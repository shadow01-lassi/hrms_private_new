import { Card } from "../ui/card";

export function ImportantInstructions({ instructions }: { instructions: string[] }) {
    return (
        <>
            <Card className="p-4 md:p-6 gap-4">
                <h1 className="sub-heading">Important Instructions</h1>
                <div className="list-disc pl-6 space-y-2">
                    {instructions.map((instruction, index) => (
                        <>
                            <li key={index}>{instruction}</li>
                            <hr />
                        </>
                    ))}
                </div>
            </Card>
        </>
    );
}