import React from 'react'

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-8 max-[425px]:py-5">
      <div className="container mx-auto px-6 max-[425px]:px-4">
        <div className="flex flex-col md:flex-row justify-between items-center text-center max-[425px]:gap-4">
          <div className="mb-4 md:mb-0">
            <h2 className="text-2xl font-bold max-[425px]:text-lg" style={{ fontFamily: "var(--font-logo)" }}>
              SIMPLICITY
            </h2>
            <p className="text-gray-600 text-sm mt-2 max-[425px]:text-xs max-[425px]:mt-1">Order in a chaotic world.</p>
          </div>
          
          <div className="text-gray-500 text-sm max-[425px]:text-xs">
            <p>© {new Date().getFullYear()} Simplicity Life Blog. All thoughts shared are my own.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer