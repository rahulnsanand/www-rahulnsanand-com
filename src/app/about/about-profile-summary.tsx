import "./about-profile-summary.module.css"
import { GlobeHemisphereWest } from "@phosphor-icons/react/dist/ssr"
import { TbBrandAzure, TbBrandCSharp, TbBrandCss3 } from "react-icons/tb"
import {
  SiAndroid,
  SiDebian,
  SiDevdotto,
  SiDocker,
  SiDotnet,
  SiFigma,
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

/**
 * Icons available to the `tool` field of `about.json > techGroups`. The key doubles as the
 * `about-tool-badge--<tool>` colour class, so adding an entry here requires a matching rule in
 * `about-profile-summary.module.css`.
 */
const toolIcons: Record<string, IconType> = {
  csharp: TbBrandCSharp,
  java: SiOpenjdk,
  sql: SiMysql,
  typescript: SiTypescript,
  css3: TbBrandCss3,
  react: SiReact,
  dotnet: SiDotnet,
  azure: TbBrandAzure,
  firebase: SiFirebase,
  docker: SiDocker,
  nginx: SiNginx,
  git: SiGit,
  shell: SiGnubash,
  yaml: SiYaml,
  debian: SiDebian,
  android: SiAndroid,
  node: SiNodedotjs,
  powerbi: PowerBiIcon,
  splunk: SiSplunk,
  mariadb: SiMariadb,
  medium: SiMedium,
  devto: SiDevdotto,
  figma: SiFigma,
}

export function AboutProfileSummary() {
  const { profile, techGroups } = aboutContent

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
          <span>{profile.timezone}</span>
        </div>

        <div className="about-tool-groups" aria-label="Tech tools by category">
          {techGroups.map((group) => (
            <div key={group.category} className="about-tool-group">
              <p className="about-tool-group-label u-font-heading">{group.category}</p>
              <div className="about-tool-badges">
                {group.items.map((item) => {
                  const Icon = toolIcons[item.tool]
                  if (!Icon) return null

                  return (
                    <span
                      key={`${group.category}-${item.tool}`}
                      className={`about-tool-badge about-tool-badge--${item.tool}`}
                      data-tooltip={item.name}
                      aria-label={`${item.name} in ${group.category}`}
                    >
                      <Icon className="about-tool-icon" aria-hidden="true" />
                    </span>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
