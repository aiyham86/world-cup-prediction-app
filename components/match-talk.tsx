"use client"

import { useMemo, useState, useTransition } from "react"
import { MessageCircle } from "lucide-react"
import { postMatchComment, saveMatchReaction } from "@/app/actions"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { MatchComment, MatchReaction, ReactionType } from "@/lib/types"

const reactionOptions: Array<{ type: ReactionType; label: string }> = [
  { type: "like", label: "👍" },
  { type: "love", label: "❤️" },
  { type: "funny", label: "😂" },
  { type: "surprised", label: "😮" },
]

function formatCommentTime(value: string, lang: "en" | "de") {
  return new Intl.DateTimeFormat(lang === "de" ? "de-DE" : "en-US", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

export function MatchTalk({
  matchId,
  initialReactions,
  initialComments,
}: {
  matchId: string
  initialReactions: MatchReaction[]
  initialComments: MatchComment[]
}) {
  const { lang, t } = useLanguage()
  const [participantName, setParticipantName] = useState("")
  const [commentText, setCommentText] = useState("")
  const [replyText, setReplyText] = useState("")
  const [replyParentId, setReplyParentId] = useState<string | null>(null)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [expandedReplyIds, setExpandedReplyIds] = useState<Set<string>>(() => new Set())
  const [reactions, setReactions] = useState(initialReactions)
  const [comments, setComments] = useState(initialComments)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const reactionCounts = useMemo(() => {
    const counts = new Map<ReactionType, number>()

    for (const reaction of reactions) {
      counts.set(reaction.reaction_type, (counts.get(reaction.reaction_type) ?? 0) + 1)
    }

    return counts
  }, [reactions])

  const mainComments = useMemo(
    () => comments.filter((comment) => !comment.parent_comment_id),
    [comments]
  )

  const repliesByParentId = useMemo(() => {
    const replies = new Map<string, MatchComment[]>()

    for (const comment of comments) {
      if (!comment.parent_comment_id) continue
      const list = replies.get(comment.parent_comment_id) ?? []
      list.push(comment)
      replies.set(comment.parent_comment_id, list)
    }

    return replies
  }, [comments])

  const handleReaction = (reactionType: ReactionType) => {
    const name = participantName.trim()

    if (!name) {
      setError(t.matchTalk.nameRequired)
      return
    }

    setError(null)
    startTransition(async () => {
      const result = await saveMatchReaction({ matchId, participantName: name, reactionType })

      if (!result.ok) {
        setError(t.matchTalk.genericError)
        return
      }

      setReactions((current) => {
        const withoutParticipantReaction = current.filter(
          (reaction) => reaction.participant_name.toLowerCase() !== result.reaction.participant_name.toLowerCase()
        )
        return [...withoutParticipantReaction, result.reaction]
      })
    })
  }

  const submitComment = (parentCommentId: string | null) => {
    const name = participantName.trim()
    const text = parentCommentId ? replyText.trim() : commentText.trim()

    if (!name) {
      setError(t.matchTalk.nameRequired)
      return
    }

    if (!text) {
      setError(t.matchTalk.commentRequired)
      return
    }

    if (text.length > 300) {
      setError(t.matchTalk.commentTooLong)
      return
    }

    setError(null)
    startTransition(async () => {
      const result = await postMatchComment({
        matchId,
        participantName: name,
        comment: text,
        parentCommentId,
      })

      if (!result.ok) {
        setError(t.matchTalk.genericError)
        return
      }

      setComments((current) => [...current, result.comment])

      if (parentCommentId) {
        setReplyText("")
        setReplyParentId(null)
        setExpandedReplyIds((current) => new Set(current).add(parentCommentId))
      } else {
        setCommentText("")
      }
    })
  }

  const toggleReplies = (commentId: string) => {
    setExpandedReplyIds((current) => {
      const next = new Set(current)

      if (next.has(commentId)) {
        next.delete(commentId)
      } else {
        next.add(commentId)
      }

      return next
    })
  }

  return (
    <div className="space-y-3 border-t border-slate-100 pt-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-emerald-700">
          <MessageCircle className="h-3.5 w-3.5" />
          {t.matchTalk.title}
        </p>
        <button
          type="button"
          onClick={() => setCommentsOpen((open) => !open)}
          className="text-xs font-bold text-emerald-700 transition hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
        >
          {commentsOpen ? t.matchTalk.hideComments : t.matchTalk.showComments}
        </button>
      </div>

      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <Input
          value={participantName}
          onChange={(event) => setParticipantName(event.target.value)}
          placeholder={t.matchTalk.namePlaceholder}
          className="h-9 text-sm"
          maxLength={80}
        />
        <div className="flex flex-wrap gap-2">
          {reactionOptions.map((reaction) => (
            <button
              key={reaction.type}
              type="button"
              onClick={() => handleReaction(reaction.type)}
              disabled={isPending}
              className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-emerald-50 hover:text-emerald-800 hover:ring-emerald-200 disabled:opacity-60"
              aria-label={t.matchTalk.reactionLabels[reaction.type]}
            >
              <span aria-hidden="true">{reaction.label}</span>{" "}
              <span className="text-xs">{reactionCounts.get(reaction.type) ?? 0}</span>
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-xs font-medium text-rose-700">{error}</p>}

      {commentsOpen && (
        <div className="space-y-3 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
          {mainComments.length === 0 ? (
            <p className="text-xs font-medium text-slate-500">{t.matchTalk.noComments}</p>
          ) : (
            <div className="space-y-3">
              {mainComments.map((comment) => {
                const replies = repliesByParentId.get(comment.id) ?? []
                const repliesOpen = expandedReplyIds.has(comment.id)

                return (
                  <div key={comment.id} className="space-y-2">
                    <div className="rounded-lg bg-white p-3 ring-1 ring-slate-100">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-black text-slate-900">{comment.participant_name}</p>
                        <p className="text-xs font-medium text-slate-400">
                          {formatCommentTime(comment.created_at, lang)}
                        </p>
                      </div>
                      <p className="mt-1 text-sm leading-5 text-slate-700">{comment.comment}</p>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs font-bold">
                        <button
                          type="button"
                          onClick={() => setReplyParentId(replyParentId === comment.id ? null : comment.id)}
                          className="text-emerald-700 hover:text-emerald-800"
                        >
                          {t.matchTalk.reply}
                        </button>
                        {replies.length > 0 && (
                          <button
                            type="button"
                            onClick={() => toggleReplies(comment.id)}
                            className="text-slate-500 hover:text-emerald-700"
                          >
                            {repliesOpen
                              ? t.matchTalk.hideReplies
                              : t.matchTalk.showReplies(replies.length)}
                          </button>
                        )}
                      </div>
                    </div>

                    {repliesOpen && (
                      <div className="ml-4 space-y-2 border-l border-emerald-100 pl-3">
                        {replies.map((reply) => (
                          <div key={reply.id} className="rounded-lg bg-white p-3 ring-1 ring-slate-100">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="text-sm font-black text-slate-900">{reply.participant_name}</p>
                              <p className="text-xs font-medium text-slate-400">
                                {formatCommentTime(reply.created_at, lang)}
                              </p>
                            </div>
                            <p className="mt-1 text-sm leading-5 text-slate-700">{reply.comment}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {replyParentId === comment.id && (
                      <div className="ml-4 grid gap-2 border-l border-emerald-100 pl-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                        <Input
                          value={replyText}
                          onChange={(event) => setReplyText(event.target.value)}
                          placeholder={t.matchTalk.replyPlaceholder}
                          maxLength={300}
                          className="h-9 text-sm"
                        />
                        <Button
                          type="button"
                          onClick={() => submitComment(comment.id)}
                          disabled={isPending}
                          className="h-9 bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          {t.matchTalk.post}
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
            <Input
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              placeholder={t.matchTalk.commentPlaceholder}
              maxLength={300}
              className="h-9 text-sm"
            />
            <Button
              type="button"
              onClick={() => submitComment(null)}
              disabled={isPending}
              className="h-9 bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {t.matchTalk.post}
            </Button>
          </div>
          <p className="text-right text-xs text-slate-400">{commentText.length}/300</p>
        </div>
      )}
    </div>
  )
}
