import Nav from "@/components/Nav"
import Footer from "@/components/Footer"
import { 
  User, 
  Heart, 
  Target, 
  BookOpen, 
  Sparkles, 
  Feather,
  Coffee,
  Moon,
  Sun,
  Brain,
  Zap,
  Shield,
  ChevronRight
} from "lucide-react"

export default function About() {
  const sections = [
    {
      title: "About Simplicity",
      content: "I created Simplicity because life started feeling loud. Not loud with noise — but loud with expectations. Do more. Become more. Prove something. Even rest began to feel like guilt. This space is my response to that.",
      highlight: "Simplicity is where I slow down, think clearly, and write honestly — not because I have everything figured out, but because I'm learning to remove what doesn't matter so I can focus on what does.",
      icon: Feather,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Who I Am",
      content: "I'm Simeon. I'm an athlete, a builder, a learner — but before all that, I'm someone trying to live with intention. I care deeply about growth, discipline, faith, and becoming whole.",
      highlight: "I believe clarity is more powerful than speed, and depth matters more than noise. I don't rush conclusions. I don't speak just to be seen. When I write, it's because something has stayed with me long enough to deserve words.",
      icon: User,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "The Tension I Live With",
      content: "I wrestle with overthinking. With the pressure to always be productive. With the fear of becoming lazy if I stop — and the fear of losing myself if I don't.",
      highlight: "I'm learning that discipline doesn't have to be violent, and rest doesn't have to be earned. This journal is part of that learning.",
      icon: Brain,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "What I'm Building",
      content: "Simplicity is a long-term archive of thoughts, lessons, and reflections from my life — as I grow in sport, in skill, in faith, and in understanding myself.",
      highlight: "I'm not building this for algorithms. I'm building it so one day, I can look back and see a clear record of who I was becoming. If it helps others along the way, that's a gift.",
      icon: Target,
      color: "text-green-600",
      bgColor: "bg-green-50"
    }
  ]

  const categories = [
    {
      title: "Discipline & Focus",
      description: "Reflections on discipline, focus, and clarity",
      icon: Zap,
      color: "text-blue-600",
      borderColor: "border-blue-200"
    },
    {
      title: "Learning & Building",
      description: "Lessons from training, learning, and building",
      icon: BookOpen,
      color: "text-purple-600",
      borderColor: "border-purple-200"
    },
    {
      title: "Faith & Growth",
      description: "Thoughts on faith, identity, and inner growth",
      icon: Heart,
      color: "text-pink-600",
      borderColor: "border-pink-200"
    },
    {
      title: "Honest Writing",
      description: "Writing that values honesty over performance",
      icon: Shield,
      color: "text-green-600",
      borderColor: "border-green-200"
    }
  ]

  const principles = [
    "Read slowly",
    "Leave when you need to",
    "Come back when it's quiet again",
    "No pressure to consume everything"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Nav />
      
      <section className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-br from-gray-50 to-white">
        <div className="absolute inset-0 bg-grid-gray-100 [mask-image:radial-gradient(white,transparent_70%)]" />
        <div className="container mx-auto px-6 relative">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              A Space for Quiet Thoughts
            </span>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-600 bg-clip-text text-transparent">
                What is it about?
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Success is in Simplicity
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-20 text-center">
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Feather className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Welcome to <span style={{fontFamily: "var(--font-logo)"}}>SIMPLICITY</span></h2>
              </div>
              <p className="text-xl text-gray-600 leading-relaxed">
                A digital journal where complexity gives way to clarity, and noise makes room for meaning.
              </p>
            </div>

            <div className="space-y-16">
              {sections.map((section, index) => (
                <div key={section.title} className={`${section.bgColor} rounded-3xl p-8 md:p-12`}>
                  <div className="flex items-start gap-6 mb-8">
                    <div className={`p-3 ${section.bgColor.replace('50', '100')} rounded-xl`}>
                      <section.icon className={`w-8 h-8 ${section.color}`} />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900">{section.title}</h3>
                  </div>
                  
                  <div className="space-y-6">
                    <p className="text-lg text-gray-700 leading-relaxed">
                      {section.content}
                    </p>
                    
                    <div className="relative">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
                      <div className="pl-8">
                        <p className="text-xl text-gray-900 font-medium leading-relaxed italic">
                          {section.highlight}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-20">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">What You'll Find Here</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  A collection of thoughts organized around themes that matter
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {categories.map((category, index) => (
                  <div key={category.title} className={`border ${category.borderColor} rounded-2xl p-6 hover:shadow-lg transition-shadow`}>
                    <div className="flex items-start gap-4">
                      <div className={`p-3 ${category.borderColor.replace('border-', 'bg-').replace('200', '50')} rounded-xl`}>
                        <category.icon className={`w-6 h-6 ${category.color}`} />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-900 mb-2">{category.title}</h4>
                        <p className="text-gray-600">{category.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8">
                <div className="flex items-center gap-4 mb-6">
                  <Coffee className="w-8 h-8 text-gray-600" />
                  <h3 className="text-2xl font-bold text-gray-900">How to Approach This Space</h3>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  {principles.map((principle, index) => (
                    <div key={principle} className="flex items-center gap-3">
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">{principle}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-20 text-center">
              <div className="inline-flex items-center gap-4 mb-8">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Moon className="w-5 h-5 text-white" />
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Sun className="w-5 h-5 text-white" />
                </div>
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-6">A Quiet Note</h2>
              
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <div className="absolute -left-8 top-0 text-6xl text-gray-300 font-serif">"</div>
                  <p className="text-2xl text-gray-700 italic leading-relaxed mb-8">
                    This isn't a place for answers. It's a place for better questions.
                  </p>
                  <div className="absolute -right-8 bottom-0 text-6xl text-gray-300 font-serif">"</div>
                </div>
                
                <p className="text-xl text-gray-600">
                  Welcome to Simplicity.
                </p>
                
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <p className="text-gray-500">
                    — Simeon
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}