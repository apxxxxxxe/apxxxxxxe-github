import { NextPage, InferGetStaticPropsType } from "next";
import React, { Suspense, useEffect } from "react";
import Link from "next/link";
import Layout from "utils/Layout";

type Props = {
  repos: Repo[];
};

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

function formatDate(date: string) {
  const d = new Date(date);
  return d.toLocaleDateString();
}

function RepoTable() {
	const defaultUser = "apxxxxxxe";
	const [user, setUser] = React.useState(defaultUser);
	const [data, setData] = React.useState([]);
	const [repos, setRepos] = React.useState([] as Repo[]);
	
	useEffect(() => {
		const fetchData = async () => {
			const json = await fetch(
				`https://api.github.com/users/apxxxxxxe/repos?per_page=100&page=1`, {method: 'GET'}
			).then((res) => res.json()) as RepoData[];

			const result = new Array<Repo>();
			json.forEach((repo) => {
				result.push({
					name: repo.name,
					description: repo.description,
					lastPushed: repo.pushed_at,
					lastUpdated: repo.updated_at,
				});
			});

			result.sort((a, b) => {
				return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
			});

			result.sort((a, b) => {
				return new Date(b.lastPushed).getTime() - new Date(a.lastPushed).getTime();
			});

			setRepos(result);
		}
		fetchData();
	}, []);

	return (
		<>
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
                      <Link href={`https://github.com/apxxxxxxe/${repo.name}`}>
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
	)
}

const Page: NextPage<Props> = () => {
  return (
    <Layout title="" contentDirection="row">
      <div className="content main-container">
        <h1>LIST</h1>
		<RepoTable />
      </div>
    </Layout>
  );
};

export default Page;
