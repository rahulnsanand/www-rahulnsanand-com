import "./about-profile-summary.module.css"
import { GlobeHemisphereWest } from "@phosphor-icons/react/dist/ssr"
import { TbBrandAzure, TbBrandCSharp, TbBrandCss3 } from "react-icons/tb"
import {
  SiAndroid,
  SiDebian,
  SiDevdotto,
  SiDocker,
  SiDotnet,
  SiFirebase,
  SiGit,
  SiGnubash,
  SiMariadb,
  SiMedium,
  SiMysql,
  SiNginx,
  SiNodedotjs,
  SiOpenjdk,
  SiReact,
  SiSplunk,
  SiTypescript,
  SiYaml,
} from "react-icons/si"
import type { IconType } from "react-icons"
import { FadeInImage } from "@/components/ui/fade-in-image"
import { aboutContent } from "@/lib/about"

const PowerBiIcon: IconType = ({ className, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    role="img"
    {...props}
  >
    <circle cx="18.2" cy="5.5" r="2.2" />
    <rect x="3" y="11" width="4.1" height="10" rx="1.4" />
    <rect x="8.5" y="8.6" width="4.1" height="12.4" rx="1.4" />
    <rect x="14" y="6.4" width="4.1" height="14.6" rx="1.4" />
  </svg>
)

const techGroups = [
  {
    category: "Language",
    items: [
      { name: "C Sharp", tone: "csharp", icon: TbBrandCSharp },
      { name: "Java", tone: "java", icon: SiOpenjdk },
      { name: "SQL", tone: "sql", icon: SiMysql },
      { name: "TypeScript", tone: "typescript", icon: SiTypescript },
      { name: "CSS3", tone: "css3", icon: TbBrandCss3 },
    ],
  },
  {
    category: "Framework",
    items: [
      { name: "React", tone: "react", icon: SiReact },
      { name: ".NET", tone: "dotnet", icon: SiDotnet },
    ],
  },
  {
    category: "Cloud",
    items: [
      { name: "Microsoft Azure", tone: "azure", icon: TbBrandAzure },
      { name: "Firebase", tone: "firebase", icon: SiFirebase },
    ],
  },
  {
    category: "DevOps",
    items: [
      { name: "Docker", tone: "docker", icon: SiDocker },
      { name: "Nginx", tone: "nginx", icon: SiNginx },
      { name: "Git", tone: "git", icon: SiGit },
      { name: "Shell Script", tone: "shell", icon: SiGnubash },
      { name: "YAML", tone: "yaml", icon: SiYaml },
      { name: "Debian", tone: "debian", icon: SiDebian },
    ],
  },
  {
    category: "Platform",
    items: [
      { name: "Android", tone: "android", icon: SiAndroid },
      { name: "Node.js", tone: "node", icon: SiNodedotjs },
      { name: "Power BI", tone: "powerbi", icon: PowerBiIcon },
      { name: "Splunk", tone: "splunk", icon: SiSplunk },
      { name: "MariaDB", tone: "mariadb", icon: SiMariadb },
    ],
  },
  {
    category: "Community",
    items: [
      { name: "Medium", tone: "medium", icon: SiMedium },
      { name: "Dev.to", tone: "devto", icon: SiDevdotto },
    ],
  },
] as const

export function AboutProfileSummary() {
  const { profile } = aboutContent

  return (
    <div className="about-profile">
      <div className="about-profile-tech-card u-frosted-surface">
        <FadeInImage
          src={profile.avatarUrl}
          alt={`${profile.name} profile photo`}
          width={144}
          height={144}
          frameClassName="about-profile-avatar-frame"
          imageClassName="about-profile-avatar"
          placeholderClassName="about-profile-avatar-placeholder"
          priority
        />
        <div className="about-timezone" aria-label={`${profile.name} timezone`}>
          <GlobeHemisphereWest size={16} weight="duotone" aria-hidden="true" />
          <span>Asia/Bangalore</span>
        </div>

        <div className="about-tool-groups" aria-label="Tech tools by category">
          {techGroups.map((group) => (
            <div key={group.category} className="about-tool-group">
              <p className="about-tool-group-label u-font-heading">{group.category}</p>
              <div className="about-tool-badges">
                {group.items.map((item) => (
                  <span
                    key={item.name}
                    className={`about-tool-badge about-tool-badge--${item.tone}`}
                    data-tooltip={item.name}
                    aria-label={`${item.name} in ${group.category}`}
                  >
                    <item.icon className="about-tool-icon" aria-hidden="true" />
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
