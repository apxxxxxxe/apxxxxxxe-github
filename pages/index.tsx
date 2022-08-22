import { NextPage } from "next";
import React, { PropsWithChildren, Suspense, useEffect } from "react";
import Link from "next/link";
import Layout from "utils/Layout";

const defaultUser = "apxxxxxxe";

type Repo = {
  name: string;
  description: string;
  lastPushed: string;
  lastUpdated: string;
};

type RepoData = {
  name: string;
  description: string;
  pushed_at: string;
  updated_at: string;
};

type ResponceData = {
  rateLimit: string;
  rateLimitRemaining: string;
  rateLimitReset: Date;
};

type Props = {
  user: string;
};

function formatDate(date: string) {
  const d = new Date(date);
  return d.toLocaleDateString();
}

function toInt(value: string) {
  const int = parseInt(value);
  if (isNaN(int)) {
    return 0;
  }
  return int;
}

function RepoTable(props: PropsWithChildren<Props>) {
  const [repos, setRepos] = React.useState([] as Repo[]);
  const [resData, setResData] = React.useState({} as ResponceData);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(
        `https://api.github.com/users/${props.user}/repos?per_page=100&page=1`,
        { method: "GET" }
      );

      setResData({
        rateLimit: res.headers.get("x-ratelimit-limit"),
        rateLimitRemaining: res.headers.get("x-ratelimit-remaining"),
        rateLimitReset: new Date(
          toInt(res.headers.get("x-ratelimit-reset")) * 1000
        ),
      } as ResponceData);

      const result = new Array<Repo>();
      if (res.ok) {
        (await res.json()).forEach((repo) => {
          result.push({
            name: repo.name,
            description: repo.description,
            lastPushed: repo.pushed_at,
            lastUpdated: repo.updated_at,
          });
        });

        result.sort((a, b) => {
          return (
            new Date(b.lastUpdated).getTime() -
            new Date(a.lastUpdated).getTime()
          );
        });

        result.sort((a, b) => {
          return (
            new Date(b.lastPushed).getTime() - new Date(a.lastPushed).getTime()
          );
        });
      } else {
        result.push({
          name: "Error",
          description: "Error",
          lastPushed: new Date().toLocaleDateString(),
          lastUpdated: new Date().toLocaleDateString(),
        });
      }

      setRepos(result);
    };
    fetchData();
  }, [props.user]);

  const responceData = Object.keys(resData).length ? (
    <p>
      API Limit: {resData.rateLimitRemaining} / {resData.rateLimit} (it
      will reset at {resData.rateLimitReset.toLocaleString()})
    </p>
  ) : (
    <></>
  );

  return (
    <>
      <div className="desc-box">
        <>
          {props.children}
          {responceData}
        </>
      </div>
      <div className="table-box">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Last Updated</th>
                <th>Last Pushed</th>
              </tr>
            </thead>
            <tbody>
              {repos.map((repo) => (
                <tr key={repo.name}>
                  <td>
                    <Link
                      href={`https://github.com/${props.user}/${repo.name}`}
                    >
                      <a>{repo.name}</a>
                    </Link>
                  </td>
                  <td>{repo.description}</td>
                  <td>{formatDate(repo.lastUpdated)}</td>
                  <td>{formatDate(repo.lastPushed)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function NameForm() {
  const [value, setValue] = React.useState(defaultUser);
  const [user, setUser] = React.useState(defaultUser);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUser(value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  return (
    <Suspense fallback={<p>Fetching {user}...</p>}>
      <RepoTable user={user}>
        <form onSubmit={handleSubmit}>
          <label htmlFor="user">
            username:{" "}
            <input
              type="text"
              id="user"
              value={value}
              onChange={handleChange}
            />
          </label>
        </form>
      </RepoTable>
    </Suspense>
  );
}

const Page: NextPage<Props> = () => {
  return (
    <Layout title="" contentDirection="row">
      <div className="content main-container">
        <h1>LIST</h1>
        <NameForm />
      </div>
    </Layout>
  );
};

export default Page;
