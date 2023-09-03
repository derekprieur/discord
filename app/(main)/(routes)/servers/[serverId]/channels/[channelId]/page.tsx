import { redirectToSignIn } from "@clerk/nextjs"

import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import ChatHeader from "@/components/chat/chat-header"
import ChatInput from "@/components/chat/chat-input"
import ChatMessages from "@/components/chat/chat-messages"
import { ChannelType } from "@prisma/client"
import MediaRoom from "@/components/media-room"

interface ChannelIDPageProps {
    params: {
        serverId: string
        channelId: string
    }
}

const ChannelIDPage = async ({ params }: ChannelIDPageProps) => {
    const profile = await currentProfile()

    if (!profile) {
        return redirectToSignIn()
    }

    const channel = await db.channel.findUnique({
        where: {
            id: params.channelId,
        }
    })

    const member = await db.member.findFirst({
        where: {
            serverId: params.serverId,
            profileId: profile.id
        }
    })

    if (!channel || !member) {
        return redirect('/')
    }

    return (
        <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
            <ChatHeader name={channel.name} serverId={channel.serverId} type='channel' />
            {channel.type === ChannelType.TEXT && (
                <>
                    <div className="flex-1">
                        <ChatMessages member={member} name={channel.name} type="channel" apiUrl="/api/messages" socketUrl="/api/socket/messages" socketQuery={{
                            channelId: channel.id,
                            serverId: channel.serverId
                        }} paramKey="channelId" paramValue={channel.id} chatId={channel.id} />
                    </div>
                    <ChatInput name={channel.name} type="channel" apiUrl="/api/socket/messages" query={{
                        channelId: channel.id,
                        serverId: channel.serverId
                    }} />
                </>
            )}
            {channel.type === ChannelType.AUDIO && (
                <MediaRoom chatId={channel.id} video={false} audio={true} />
            )}
            {channel.type === ChannelType.VIDEO && (
                <MediaRoom chatId={channel.id} video={true} audio={false} />
            )}
        </div>
    )
}

export default ChannelIDPage