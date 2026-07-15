import { useEffect, useMemo, useState } from "react";
import { ExternalLink, ImageIcon, Landmark, Palette, UserRound } from "lucide-react";
import { getArtisanProfile } from "../data/artisanProfiles";
import "./GovArtisanVisualization.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const FALLBACK_GOV_RECORD = {
  state: "Rajasthan",
  beneficiaries: {
    "2019-20": 344,
    "2020-21": 0,
    "2021-22": 185,
    "2022-23": 0,
  },
  total: 529,
};

function formatNumber(value) {
  return new Intl.NumberFormat("en-IN").format(Number(value) || 0);
}

function getRecordTotal(record) {
  return record?.total || Object.values(record?.beneficiaries || {}).reduce((sum, value) => sum + Number(value || 0), 0);
}

export default function GovArtisanVisualization() {
  const [govData, setGovData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sourceStatus, setSourceStatus] = useState("fallback");
  const artisan = getArtisanProfile("rj1");

  useEffect(() => {
    let ignore = false;

    async function fetchGovernmentArtisanData() {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/blog/government-artisan-benefits/`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const payload = await response.json();
        if (!ignore) {
          setGovData(payload);
          setSourceStatus(payload.source || "data.gov.in");
        }
      } catch {
        if (!ignore) {
          setGovData({
            source: "fallback",
            source_url: "https://www.data.gov.in/resource/stateut-wise-details-number-handicraft-artisans-benefitted-marketing-support-and-services",
            records: [FALLBACK_GOV_RECORD],
          });
          setSourceStatus("fallback");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchGovernmentArtisanData();
    return () => {
      ignore = true;
    };
  }, []);

  const stateRecord = useMemo(() => {
    const records = govData?.records || [];
    return records.find((record) => record.state === artisan.state) || FALLBACK_GOV_RECORD;
  }, [govData, artisan.state]);

  const maxYearValue = Math.max(...Object.values(stateRecord.beneficiaries || {}), 1);
  const totalBeneficiaries = getRecordTotal(stateRecord);

  return (
    <main className="gov-viz-page">
      <section className="gov-viz-hero">
        <div className="gov-viz-copy">
          <p className="gov-viz-kicker">
            <Landmark size={16} />
            Government API Visualization
          </p>
          <h1>{artisan.name}</h1>
          <p className="gov-viz-subtitle">
            A single artisan spotlight connected with official Data.gov.in state-level handicraft support data.
            The government API confirms beneficiary counts by state and year; it does not provide individual artisan photos.
          </p>
          <div className="gov-viz-tags">
            <span>{artisan.state}</span>
            <span>{artisan.artStyle}</span>
            <span>{sourceStatus === "data.gov.in" ? "Live API" : "Fallback data"}</span>
          </div>
        </div>

        <aside className="gov-viz-portrait" aria-label={`${artisan.name} image`}>
          {artisan.profileImage ? (
            <img className="gov-viz-portrait-photo" src={artisan.profileImage} alt={artisan.imageAlt || artisan.name} />
          ) : (
            <div className="gov-viz-portrait-art">
              <UserRound size={82} />
            </div>
          )}
          <div>
            <strong>{artisan.profileImage ? "Artist craft image" : "Official artist photo unavailable"}</strong>
            <p>
              {artisan.profileImage
                ? `${artisan.imageCredit}. Data.gov.in provides state-level records, not personal portrait photos.`
                : "Data.gov.in does not include a personal photo field for this dataset."}
            </p>
          </div>
        </aside>
      </section>

      <section className="gov-viz-layout">
        <article className="gov-viz-card gov-viz-official-card">
          <div className="gov-card-title">
            <Landmark size={20} />
            <div>
              <p>Official Government Dataset</p>
              <h2>{artisan.state} Beneficiary Snapshot</h2>
            </div>
          </div>

          {loading ? (
            <div className="gov-viz-loading">Loading government API data...</div>
          ) : (
            <>
              <div className="gov-total-box">
                <span>Total beneficiaries</span>
                <strong>{formatNumber(totalBeneficiaries)}</strong>
              </div>

              <div className="gov-year-bars">
                {Object.entries(stateRecord.beneficiaries).map(([year, value]) => (
                  <div key={year} className="gov-year-row">
                    <span>{year}</span>
                    <div>
                      <i style={{ width: `${Math.max(7, (Number(value) / maxYearValue) * 100)}%` }} />
                    </div>
                    <strong>{formatNumber(value)}</strong>
                  </div>
                ))}
              </div>

              <a className="gov-source-button" href={govData?.source_url} target="_blank" rel="noreferrer">
                Open Data.gov.in source
                <ExternalLink size={16} />
              </a>
            </>
          )}
        </article>

        <article className="gov-viz-card">
          <div className="gov-card-title">
            <Palette size={20} />
            <div>
              <p>Arts Presented On KalaShaala</p>
              <h2>{artisan.artStyle}</h2>
            </div>
          </div>
          <p className="gov-artist-bio">{artisan.bio}</p>
          <div className="gov-art-list">
            {artisan.artForms.map((form) => (
              <span key={form}>{form}</span>
            ))}
          </div>
        </article>
      </section>

      <section className="gov-art-showcase">
        <div className="gov-card-title">
          <ImageIcon size={20} />
          <div>
            <p>Art Pictures</p>
            <h2>Artwork image visualization</h2>
          </div>
        </div>
        <div className="gov-art-grid">
          {artisan.works.slice(0, 3).map((work) => (
            <article key={work.id} className={`gov-art-panel ${work.motif}`}>
              <div className="gov-art-panel-picture">
                {work.image ? <img src={work.image} alt={work.imageAlt || work.title} loading="lazy" /> : <span />}
              </div>
              <strong>{work.title}</strong>
              <p>{work.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
