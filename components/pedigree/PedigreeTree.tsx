"use client";

import React from "react";
import { PedigreeNodeData } from "@/types/pedigree";
import { PedigreeNode } from "./PedigreeNode";

export interface PedigreeTreeProps {
  tree: PedigreeNodeData;
}

export function PedigreeTree({ tree }: PedigreeTreeProps) {
  const father = tree.father;
  const mother = tree.mother;

  const fatherFather = father?.father;
  const fatherMother = father?.mother;

  const motherFather = mother?.father;
  const motherMother = mother?.mother;

  return (
    <div className="overflow-x-auto py-6 px-4 bg-slate-50/50 rounded-2xl border border-slate-200">
      <div className="min-w-[860px] flex items-center gap-8 justify-start">
        {/* Generation 0: Subject */}
        <div className="flex flex-col items-center">
          <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2 bg-emerald-100 px-3 py-1 rounded-full">
            Subject Pigeon (Gen 0)
          </div>
          <PedigreeNode node={tree} isRoot={true} />
        </div>

        {/* Connector G0 -> G1 */}
        <div className="flex flex-col items-center justify-center h-full w-4">
          <div className="w-4 h-0.5 bg-slate-300" />
        </div>

        {/* Generation 1: Parents (Sire & Dam) */}
        <div className="flex flex-col justify-between gap-12">
          {/* Father Branch */}
          <div className="flex flex-col gap-2">
            <div className="text-[10px] font-bold text-sky-700 uppercase tracking-wider bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-md inline-flex self-start">
              Sire (Father)
            </div>
            <PedigreeNode
              node={
                father || {
                  pigeon: null,
                  generation: 1,
                  relation: "Father",
                }
              }
            />
          </div>

          {/* Mother Branch */}
          <div className="flex flex-col gap-2">
            <div className="text-[10px] font-bold text-pink-700 uppercase tracking-wider bg-pink-50 border border-pink-200 px-2 py-0.5 rounded-md inline-flex self-start">
              Dam (Mother)
            </div>
            <PedigreeNode
              node={
                mother || {
                  pigeon: null,
                  generation: 1,
                  relation: "Mother",
                }
              }
            />
          </div>
        </div>

        {/* Connector G1 -> G2 */}
        <div className="flex flex-col items-center justify-center h-full w-4">
          <div className="w-4 h-0.5 bg-slate-300" />
        </div>

        {/* Generation 2: Grandparents (4 Nodes) */}
        <div className="flex flex-col justify-between gap-6">
          {/* Paternal Grandparents */}
          <div className="space-y-3 p-3 bg-sky-50/30 rounded-xl border border-sky-100/80">
            <span className="text-[9px] font-bold uppercase text-sky-600 tracking-wider">
              Paternal Grandparents
            </span>
            <div className="space-y-3">
              <PedigreeNode
                node={
                  fatherFather || {
                    pigeon: null,
                    generation: 2,
                    relation: "Father's Father",
                  }
                }
              />
              <PedigreeNode
                node={
                  fatherMother || {
                    pigeon: null,
                    generation: 2,
                    relation: "Father's Mother",
                  }
                }
              />
            </div>
          </div>

          {/* Maternal Grandparents */}
          <div className="space-y-3 p-3 bg-pink-50/30 rounded-xl border border-pink-100/80">
            <span className="text-[9px] font-bold uppercase text-pink-600 tracking-wider">
              Maternal Grandparents
            </span>
            <div className="space-y-3">
              <PedigreeNode
                node={
                  motherFather || {
                    pigeon: null,
                    generation: 2,
                    relation: "Mother's Father",
                  }
                }
              />
              <PedigreeNode
                node={
                  motherMother || {
                    pigeon: null,
                    generation: 2,
                    relation: "Mother's Mother",
                  }
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
