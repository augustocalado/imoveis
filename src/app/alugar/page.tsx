import { redirect } from 'next/navigation';

export default function AlugarRedirect() {
    redirect('/imoveis?type=aluguel');
}
