import type { AnchorHTMLAttributes } from 'react'
import { Term } from '../../components/Term'
import { Callout } from '../../components/Callout'
import { ArchDiagram } from '../../components/ArchDiagram'
import { Scrolly, Step } from '../../components/Scrolly'
import { DnsJourney } from '../../simulators/dns/DnsJourney'
import { CacheLab } from '../../simulators/cache/CacheLab'
import { HitRatioCalc } from '../../simulators/cache/HitRatioCalc'
import { StampedeSim } from '../../simulators/cache/StampedeSim'
import { Stepper } from '../../components/Stepper'
import { RequestJourney } from '../../simulators/journey/RequestJourney'
import { LatencyLadder } from '../../simulators/latency/LatencyLadder'
import { EstimationCalc } from '../../simulators/estimation/EstimationCalc'
import { LossyLink } from '../../simulators/loss/LossyLink'
import { RaceDemo } from '../../simulators/race/RaceDemo'
import { RestSandbox } from '../../simulators/rest/RestSandbox'
import { QueryPlayground } from '../../simulators/query/QueryPlayground'
import { HashMapLab } from '../../simulators/hashmap/HashMapLab'
import { PacketLab } from '../../simulators/packets/PacketLab'
import { HttpAnatomy } from '../../simulators/http/HttpAnatomy'

function A(props: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const external = props.href?.startsWith('http')
  return <a {...props} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})} />
}

/** Everything a lesson .mdx file can use. */
export const mdxComponents = {
  a: A,
  Term,
  Callout,
  ArchDiagram,
  Scrolly,
  Step,
  DnsJourney,
  CacheLab,
  HitRatioCalc,
  StampedeSim,
  Stepper,
  RequestJourney,
  LatencyLadder,
  EstimationCalc,
  LossyLink,
  RaceDemo,
  RestSandbox,
  QueryPlayground,
  HashMapLab,
  PacketLab,
  HttpAnatomy,
}
