import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

export default function UMLDiagramGenerator({
  receivedTimestamp,
  repositoryDescription,
  setRepositoryDescription,
  handleGenerateUML,
  isGeneratingUML,
  generatePlantUmlPng,
  isGeneratingPlantUml,
  umlError,
  plantUmlError,
  plantUmlImage,
  generatedUML,
  renderMermaidDiagram,
  aiInsights,
  aiModel,
}) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">UML Diagram Generator</h3>

      {/* Timestamp Display */}
      {receivedTimestamp && (
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
          <p className="text-sm text-blue-400">
            <span className="font-medium">Received:</span>{" "}
            {new Date(receivedTimestamp).toLocaleString()}
          </p>
        </div>
      )}

      {/* Repository Description Preview (read-only) */}
      {repositoryDescription ? (
        <div className="space-y-2 rounded-lg border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-medium text-emerald-300">
            Repository description provided via redirect
          </p>
          <p className="text-sm text-foreground/80 whitespace-pre-wrap">
            {repositoryDescription.length > 500
              ? `${repositoryDescription.slice(0, 500)}...`
              : repositoryDescription}
          </p>
        </div>
      ) : (
        <div className="space-y-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-sm text-red-400">
            No repository description received. Paste a description below or
            start from the upload/submit flow.
          </p>
          <textarea
            value={repositoryDescription}
            onChange={(e) => setRepositoryDescription?.(e.target.value)}
            placeholder="Paste repository description to enable UML generation"
            rows="4"
            className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm placeholder:text-foreground/50 focus:border-emerald-400 focus:outline-none focus:ring-0"
          />
        </div>
      )}

      {/* Generate Button */}
      <HoverBorderGradient
        as="button"
        onClick={() => handleGenerateUML?.()}
        disabled={!handleGenerateUML || isGeneratingUML || !repositoryDescription}
        containerClassName="w-full"
        className="group relative w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-emerald-500 disabled:hover:to-emerald-600 transition-all duration-300 flex items-center justify-center gap-2"
      >
        {isGeneratingUML ? (
          <>
            <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full"></div>
            <span>Generating UML Diagram...</span>
          </>
        ) : (
          <>
            <svg
              className="h-5 w-5 transition-transform duration-300 group-hover:scale-110"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span className="tracking-wide">Generate UML Diagram</span>
            <svg
              className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </>
        )}
      </HoverBorderGradient>

      <HoverBorderGradient
        as="button"
        onClick={() => generatePlantUmlPng?.()}
        disabled={!generatePlantUmlPng || isGeneratingPlantUml || !repositoryDescription}
        containerClassName="w-full"
        className="group relative w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-black text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-500 disabled:hover:to-blue-600 transition-all duration-300 flex items-center justify-center gap-2"
      >
        {isGeneratingPlantUml ? (
          <>
            <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full"></div>
            <span>Generating PlantUML PNG...</span>
          </>
        ) : (
          <>
            <svg
              className="h-5 w-5 transition-transform duration-300 group-hover:scale-110"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="tracking-wide">Generate PlantUML PNG</span>
            <svg
              className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </>
        )}
      </HoverBorderGradient>

      {/* Error Display */}
      {umlError && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-sm text-red-400">{umlError}</p>
        </div>
      )}

      {plantUmlError && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-sm text-red-400">{plantUmlError}</p>
        </div>
      )}

      {plantUmlImage && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-medium">PlantUML PNG</h4>
            <div className="flex gap-2">
              <a
                href={plantUmlImage}
                download="diagram.png"
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-foreground/80 hover:bg-white/20"
              >
                Download PNG
              </a>
              <HoverBorderGradient
                as="button"
                onClick={() => navigator.clipboard.writeText(plantUmlImage)}
                className="bg-white/5 text-foreground/80 text-xs font-medium"
              >
                Copy Image Data URL
              </HoverBorderGradient>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/5 p-4 flex justify-center">
            <img
              src={plantUmlImage}
              alt="PlantUML diagram"
              className="max-h-96 object-contain"
            />
          </div>
        </div>
      )}

      {/* AI Model Badge */}
      {aiModel && (
        <div className="rounded-lg border border-purple-500/20 bg-purple-500/10 p-3">
          <p className="text-sm text-purple-400">
            <span className="font-medium">Powered by:</span> {aiModel}
          </p>
        </div>
      )}

      {/* AI Insights */}
      {aiInsights && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-emerald-400">🤖 AI Codebase Insights</h4>
            <HoverBorderGradient
              as="button"
              onClick={() => navigator.clipboard.writeText(aiInsights)}
              className="bg-white/5 text-foreground/80 text-xs font-medium"
            >
              Copy Insights
            </HoverBorderGradient>
          </div>
          <div className="rounded-lg border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 p-6">
            <div className="prose prose-invert max-w-none">
              <div 
                className="text-sm leading-relaxed space-y-2"
                style={{
                  whiteSpace: 'pre-wrap',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}
              >
                {aiInsights.split('\n').map((line, idx) => {
                  // Remove asterisks from the line
                  const cleanLine = line.replace(/\*/g, '');
                  
                  // Style headers
                  if (cleanLine.match(/^[📊🔄🏗️⚡🔍💡]/)) {
                    return (
                      <div key={idx} className="font-bold text-base text-emerald-300 mt-4 mb-2">
                        {cleanLine}
                      </div>
                    );
                  }
                  // Style bullet points
                  if (cleanLine.trim().startsWith('•')) {
                    return (
                      <div key={idx} className="pl-4 text-foreground/90">
                        {cleanLine}
                      </div>
                    );
                  }
                  // Regular lines
                  return cleanLine.trim() ? (
                    <div key={idx} className="text-foreground/90">{cleanLine}</div>
                  ) : (
                    <div key={idx} className="h-2"></div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generated UML Display */}
      {generatedUML && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-medium">Generated UML Diagram</h4>
            <HoverBorderGradient
              as="button"
              onClick={() => navigator.clipboard.writeText(generatedUML)}
              className="bg-white/5 text-foreground/80 text-xs font-medium"
            >
              Copy Mermaid Code
            </HoverBorderGradient>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            {renderMermaidDiagram
              ? renderMermaidDiagram(generatedUML)
              : "Mermaid renderer not available."}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Mermaid Code:</label>
            <pre className="rounded-lg border border-white/10 bg-black/20 p-4 text-xs overflow-x-auto">
              <code className="text-green-400">{generatedUML}</code>
            </pre>
          </div>
        </div>
      )}

      
    </div>
  );
};


